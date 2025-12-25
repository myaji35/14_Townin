import 'package:json_annotation/json_annotation.dart';
import '../enums/flyer_category.dart';
import '../enums/flyer_status.dart';
import 'merchant_model.dart';

part 'flyer_model.g.dart';

@JsonSerializable()
class FlyerModel {
  final String id;
  final String merchantId;
  final String title;
  final String? description;
  final String imageUrl;

  @JsonKey(fromJson: _categoryFromJson, toJson: _categoryToJson)
  final FlyerCategory category;

  @JsonKey(fromJson: _statusFromJson, toJson: _statusToJson)
  final FlyerStatus status;

  final int targetRadius;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? regionId;

  final int viewCount;
  final int clickCount;
  final int conversionCount;

  final bool isActive;
  final DateTime createdAt;
  final DateTime? expiresAt;

  final MerchantModel? merchant;

  FlyerModel({
    required this.id,
    required this.merchantId,
    required this.title,
    this.description,
    required this.imageUrl,
    required this.category,
    required this.status,
    this.targetRadius = 1000,
    this.startDate,
    this.endDate,
    this.regionId,
    this.viewCount = 0,
    this.clickCount = 0,
    this.conversionCount = 0,
    this.isActive = true,
    required this.createdAt,
    this.expiresAt,
    this.merchant,
  });

  factory FlyerModel.fromJson(Map<String, dynamic> json) =>
      _$FlyerModelFromJson(json);

  Map<String, dynamic> toJson() => _$FlyerModelToJson(this);

  static FlyerCategory _categoryFromJson(String value) =>
      FlyerCategory.fromString(value);

  static String _categoryToJson(FlyerCategory category) => category.name;

  static FlyerStatus _statusFromJson(String value) =>
      FlyerStatus.fromString(value);

  static String _statusToJson(FlyerStatus status) => status.toJson();

  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  bool get isActive_AndApproved {
    return isActive && status == FlyerStatus.approved && !isExpired;
  }

  String get categoryDisplayName => category.displayName;

  String get statusDisplayName => status.displayName;
}
