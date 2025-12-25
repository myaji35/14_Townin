import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'townin.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Flyers table
    await db.execute('''
      CREATE TABLE flyers (
        id TEXT PRIMARY KEY,
        merchant_id TEXT,
        merchant_name TEXT,
        title TEXT,
        description TEXT,
        image_url TEXT,
        view_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        valid_from TEXT,
        valid_until TEXT,
        grid_cell TEXT,
        created_at TEXT,
        cached_at TEXT
      )
    ''');

    // Flyer products table
    await db.execute('''
      CREATE TABLE flyer_products (
        id TEXT PRIMARY KEY,
        flyer_id TEXT,
        product_name TEXT,
        price REAL,
        original_price REAL,
        promotion TEXT,
        category TEXT,
        display_order INTEGER,
        FOREIGN KEY (flyer_id) REFERENCES flyers (id) ON DELETE CASCADE
      )
    ''');

    // Safety facilities table
    await db.execute('''
      CREATE TABLE safety_facilities (
        id TEXT PRIMARY KEY,
        facility_type TEXT,
        name TEXT,
        latitude REAL,
        longitude REAL,
        grid_cell TEXT,
        is_active INTEGER DEFAULT 1,
        cached_at TEXT
      )
    ''');

    // Create indexes
    await db.execute('CREATE INDEX idx_flyers_grid_cell ON flyers(grid_cell)');
    await db.execute('CREATE INDEX idx_flyers_valid ON flyers(valid_until)');
    await db.execute('CREATE INDEX idx_flyer_products_flyer_id ON flyer_products(flyer_id)');
    await db.execute('CREATE INDEX idx_safety_grid_cell ON safety_facilities(grid_cell)');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
    if (oldVersion < newVersion) {
      // Example: Add new columns or tables
    }
  }

  // Clear all cached data
  Future<void> clearCache() async {
    final db = await database;
    await db.delete('flyers');
    await db.delete('flyer_products');
    await db.delete('safety_facilities');
  }

  // Clear expired flyers
  Future<void> clearExpiredFlyers() async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    await db.delete(
      'flyers',
      where: 'valid_until < ?',
      whereArgs: [now],
    );
  }

  // Get database size
  Future<int> getDatabaseSize() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, 'townin.db');
    File dbFile = File(path);
    if (await dbFile.exists()) {
      return await dbFile.length();
    }
    return 0;
  }

  // Close database
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }
}
