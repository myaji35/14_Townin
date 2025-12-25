import 'package:json_annotation/json_annotation.dart';

part 'merchant_model.g.dart';

@JsonSerializable()
class MerchantModel {
  final String id;
  final String businessName;
  final String? businessNumber;
  final String? phoneNumber;
  final String? address;
  final String? gridCell;
  final bool isActive;

  MerchantModel({
    required this.id,
    required this.businessName,
    this.businessNumber,
    this.phoneNumber,
    this.address,
    this.gridCell,
    this.isActive = true,
  });

  factory MerchantModel.fromJson(Map<String, dynamic> json) =>
      _$MerchantModelFromJson(json);

  Map<String, dynamic> toJson() => _$MerchantModelToJson(this);
}
