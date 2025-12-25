// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flyer_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FlyerModel _$FlyerModelFromJson(Map<String, dynamic> json) => FlyerModel(
      id: json['id'] as String,
      merchantId: json['merchantId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String,
      category: FlyerModel._categoryFromJson(json['category'] as String),
      status: FlyerModel._statusFromJson(json['status'] as String),
      targetRadius: json['targetRadius'] as int? ?? 1000,
      startDate: json['startDate'] == null
          ? null
          : DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] == null
          ? null
          : DateTime.parse(json['endDate'] as String),
      regionId: json['regionId'] as String?,
      viewCount: json['viewCount'] as int? ?? 0,
      clickCount: json['clickCount'] as int? ?? 0,
      conversionCount: json['conversionCount'] as int? ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      expiresAt: json['expiresAt'] == null
          ? null
          : DateTime.parse(json['expiresAt'] as String),
      merchant: json['merchant'] == null
          ? null
          : MerchantModel.fromJson(json['merchant'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$FlyerModelToJson(FlyerModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'merchantId': instance.merchantId,
      'title': instance.title,
      'description': instance.description,
      'imageUrl': instance.imageUrl,
      'category': FlyerModel._categoryToJson(instance.category),
      'status': FlyerModel._statusToJson(instance.status),
      'targetRadius': instance.targetRadius,
      'startDate': instance.startDate?.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
      'regionId': instance.regionId,
      'viewCount': instance.viewCount,
      'clickCount': instance.clickCount,
      'conversionCount': instance.conversionCount,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'expiresAt': instance.expiresAt?.toIso8601String(),
      'merchant': instance.merchant?.toJson(),
    };
