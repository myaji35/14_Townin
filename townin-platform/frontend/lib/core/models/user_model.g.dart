// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      role: UserModel._roleFromJson(json['role'] as String),
      ageRange: json['age_range'] as String?,
      householdType: json['household_type'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      lastLoginAt: json['last_login_at'] == null
          ? null
          : DateTime.parse(json['last_login_at'] as String),
    );

Map<String, dynamic> _$UserModelToJson(UserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'role': UserModel._roleToJson(instance.role),
      'age_range': instance.ageRange,
      'household_type': instance.householdType,
      'created_at': instance.createdAt?.toIso8601String(),
      'last_login_at': instance.lastLoginAt?.toIso8601String(),
    };
