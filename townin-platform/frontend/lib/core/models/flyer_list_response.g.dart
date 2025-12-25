// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flyer_list_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FlyerListResponse _$FlyerListResponseFromJson(Map<String, dynamic> json) =>
    FlyerListResponse(
      data: (json['data'] as List<dynamic>)
          .map((e) => FlyerModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: json['total'] as int,
    );

Map<String, dynamic> _$FlyerListResponseToJson(FlyerListResponse instance) =>
    <String, dynamic>{
      'data': instance.data.map((e) => e.toJson()).toList(),
      'total': instance.total,
    };
