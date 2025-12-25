import 'package:flutter/material.dart';
import '../../../core/enums/flyer_category.dart';

class CategoryFilterBar extends StatelessWidget {
  final FlyerCategory? selectedCategory;
  final Function(FlyerCategory?) onCategorySelected;

  const CategoryFilterBar({
    Key? key,
    required this.selectedCategory,
    required this.onCategorySelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      color: Colors.white,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        children: [
          _buildCategoryChip(
            context,
            label: '전체',
            isSelected: selectedCategory == null,
            onTap: () => onCategorySelected(null),
          ),
          ...FlyerCategory.values.map((category) {
            return _buildCategoryChip(
              context,
              label: category.displayName,
              isSelected: selectedCategory == category,
              onTap: () => onCategorySelected(category),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
        checkmarkColor: Theme.of(context).primaryColor,
        labelStyle: TextStyle(
          color: isSelected
              ? Theme.of(context).primaryColor
              : Colors.grey[700],
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
