import 'package:json_annotation/json_annotation.dart';
import 'flyer_model.dart';

part 'flyer_list_response.g.dart';

@JsonSerializable()
class FlyerListResponse {
  final List<FlyerModel> data;
  final int total;

  FlyerListResponse({
    required this.data,
    required this.total,
  });

  factory FlyerListResponse.fromJson(Map<String, dynamic> json) =>
      _$FlyerListResponseFromJson(json);

  Map<String, dynamic> toJson() => _$FlyerListResponseToJson(this);
}
