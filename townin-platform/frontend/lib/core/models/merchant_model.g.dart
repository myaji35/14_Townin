// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'merchant_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MerchantModel _$MerchantModelFromJson(Map<String, dynamic> json) =>
    MerchantModel(
      id: json['id'] as String,
      businessName: json['businessName'] as String,
      businessNumber: json['businessNumber'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      address: json['address'] as String?,
      gridCell: json['gridCell'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );

Map<String, dynamic> _$MerchantModelToJson(MerchantModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'businessName': instance.businessName,
      'businessNumber': instance.businessNumber,
      'phoneNumber': instance.phoneNumber,
      'address': instance.address,
      'gridCell': instance.gridCell,
      'isActive': instance.isActive,
    };
