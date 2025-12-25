enum FlyerStatus {
  draft,
  pendingApproval,
  approved,
  rejected,
  expired;

  String get displayName {
    switch (this) {
      case FlyerStatus.draft:
        return '임시저장';
      case FlyerStatus.pendingApproval:
        return '승인 대기';
      case FlyerStatus.approved:
        return '승인됨';
      case FlyerStatus.rejected:
        return '거부됨';
      case FlyerStatus.expired:
        return '만료됨';
    }
  }

  static FlyerStatus fromString(String value) {
    switch (value) {
      case 'draft':
        return FlyerStatus.draft;
      case 'pending_approval':
        return FlyerStatus.pendingApproval;
      case 'approved':
        return FlyerStatus.approved;
      case 'rejected':
        return FlyerStatus.rejected;
      case 'expired':
        return FlyerStatus.expired;
      default:
        return FlyerStatus.draft;
    }
  }

  String toJson() {
    switch (this) {
      case FlyerStatus.draft:
        return 'draft';
      case FlyerStatus.pendingApproval:
        return 'pending_approval';
      case FlyerStatus.approved:
        return 'approved';
      case FlyerStatus.rejected:
        return 'rejected';
      case FlyerStatus.expired:
        return 'expired';
    }
  }
}
