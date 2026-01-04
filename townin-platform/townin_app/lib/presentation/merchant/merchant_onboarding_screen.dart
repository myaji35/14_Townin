import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';

class MerchantOnboardingScreen extends ConsumerStatefulWidget {
  const MerchantOnboardingScreen({super.key});

  @override
  ConsumerState<MerchantOnboardingScreen> createState() =>
      _MerchantOnboardingScreenState();
}

class _MerchantOnboardingScreenState
    extends ConsumerState<MerchantOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

  // Form controllers
  final _storeNameController = TextEditingController();
  final _ownerNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _businessNumberController = TextEditingController();
  final _addressController = TextEditingController();
  final _categoryController = TextEditingController();

  @override
  void dispose() {
    _storeNameController.dispose();
    _ownerNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _businessNumberController.dispose();
    _addressController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgApp,
      appBar: AppBar(
        title: const Text('상인 가입하기'),
        backgroundColor: AppTheme.bgSidebar,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: Stepper(
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 2) {
              setState(() {
                _currentStep += 1;
              });
            } else {
              // Submit
              if (_formKey.currentState!.validate()) {
                _handleSubmit();
              }
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() {
                _currentStep -= 1;
              });
            } else {
              Navigator.pop(context);
            }
          },
          controlsBuilder: (context, details) {
            return Padding(
              padding: const EdgeInsets.only(top: AppTheme.space4),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: details.onStepContinue,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(_currentStep == 2 ? '가입 완료' : '다음'),
                    ),
                  ),
                  const SizedBox(width: AppTheme.space3),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: details.onStepCancel,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(_currentStep == 0 ? '취소' : '이전'),
                    ),
                  ),
                ],
              ),
            );
          },
          steps: [
            // Step 1: 기본 정보
            Step(
              title: const Text('기본 정보'),
              content: _buildBasicInfoStep(),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            ),
            
            // Step 2: 사업자 정보
            Step(
              title: const Text('사업자 정보'),
              content: _buildBusinessInfoStep(),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            ),
            
            // Step 3: 매장 정보
            Step(
              title: const Text('매장 정보'),
              content: _buildStoreInfoStep(),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBasicInfoStep() {
    return Column(
      children: [
        TextFormField(
          controller: _ownerNameController,
          decoration: const InputDecoration(
            labelText: '대표자명',
            hintText: '홍길동',
            prefixIcon: Icon(Icons.person),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '대표자명을 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        TextFormField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: '연락처',
            hintText: '010-1234-5678',
            prefixIcon: Icon(Icons.phone),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '연락처를 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        TextFormField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(
            labelText: '이메일',
            hintText: 'merchant@example.com',
            prefixIcon: Icon(Icons.email),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '이메일을 입력해주세요';
            }
            if (!value.contains('@')) {
              return '올바른 이메일 형식이 아닙니다';
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildBusinessInfoStep() {
    return Column(
      children: [
        TextFormField(
          controller: _businessNumberController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: '사업자 등록번호',
            hintText: '123-45-67890',
            prefixIcon: Icon(Icons.business),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '사업자 등록번호를 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        Container(
          padding: const EdgeInsets.all(AppTheme.space4),
          decoration: BoxDecoration(
            color: AppTheme.bgCard,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(
              color: Colors.white.withOpacity(0.05),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.upload_file, color: AppTheme.accentGold),
                  const SizedBox(width: AppTheme.space2),
                  const Text(
                    '사업자 등록증',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.space3),
              OutlinedButton.icon(
                onPressed: () {
                  // TODO: File picker
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('파일 선택 기능 준비 중...')),
                  );
                },
                icon: const Icon(Icons.add_photo_alternate),
                label: const Text('사업자 등록증 업로드'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),
              const SizedBox(height: AppTheme.space2),
              const Text(
                '* JPG, PNG 파일 (최대 5MB)',
                style: TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStoreInfoStep() {
    return Column(
      children: [
        TextFormField(
          controller: _storeNameController,
          decoration: const InputDecoration(
            labelText: '매장명',
            hintText: '의정부 맛집',
            prefixIcon: Icon(Icons.store),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '매장명을 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        TextFormField(
          controller: _categoryController,
          decoration: const InputDecoration(
            labelText: '업종',
            hintText: '한식, 카페, 뷰티 등',
            prefixIcon: Icon(Icons.category),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '업종을 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        TextFormField(
          controller: _addressController,
          decoration: const InputDecoration(
            labelText: '매장 주소',
            hintText: '경기도 의정부시...',
            prefixIcon: Icon(Icons.location_on),
            suffixIcon: Icon(Icons.search),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '매장 주소를 입력해주세요';
            }
            return null;
          },
        ),
        const SizedBox(height: AppTheme.space4),
        
        Container(
          padding: const EdgeInsets.all(AppTheme.space4),
          decoration: BoxDecoration(
            color: AppTheme.bgCardHover.withOpacity(0.5),
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(
              color: AppTheme.accentGold.withOpacity(0.3),
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.space2),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: const Icon(
                  Icons.info_outline,
                  color: AppTheme.accentGold,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppTheme.space3),
              const Expanded(
                child: Text(
                  '가입 완료 후 담당 보안관의 승인을 거쳐 서비스를 이용하실 수 있습니다.',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _handleSubmit() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('가입 신청이 완료되었습니다!'),
        backgroundColor: AppTheme.success,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: '확인',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );

    // Navigate back after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.pop(context);
      }
    });
  }
}
