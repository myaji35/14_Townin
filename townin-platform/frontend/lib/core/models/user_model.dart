import 'package:json_annotation/json_annotation.dart';
import '../enums/user_role.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  @JsonKey(name: 'role', fromJson: _roleFromJson, toJson: _roleToJson)
  final UserRole role;
  @JsonKey(name: 'age_range')
  final String? ageRange;
  @JsonKey(name: 'household_type')
  final String? householdType;
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @JsonKey(name: 'last_login_at')
  final DateTime? lastLoginAt;

  UserModel({
    required this.id,
    required this.email,
    required this.role,
    this.ageRange,
    this.householdType,
    this.createdAt,
    this.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  static UserRole _roleFromJson(String value) => UserRole.fromString(value);
  static String _roleToJson(UserRole role) => role.value;
}
