import 'dart:io';
import 'package:flutter/material.dart';
import 'package:arcore_flutter_plugin/arcore_flutter_plugin.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

/// Android ARCore View Implementation
class AndroidARView extends StatefulWidget {
  final Function(Map<String, dynamic>) onFlyerTapped;
  final List<Map<String, dynamic>> arFlyers;

  const AndroidARView({
    super.key,
    required this.onFlyerTapped,
    required this.arFlyers,
  });

  @override
  State<AndroidARView> createState() => _AndroidARViewState();
}

class _AndroidARViewState extends State<AndroidARView> {
  ArCoreController? arCoreController;
  final Map<String, ArCoreNode> _addedNodes = {};

  @override
  Widget build(BuildContext context) {
    return ArCoreView(
      onArCoreViewCreated: _onArCoreViewCreated,
      enableTapRecognizer: true,
    );
  }

  void _onArCoreViewCreated(ArCoreController controller) {
    arCoreController = controller;
    controller.onNodeTap = _handleNodeTap;
    _addARNodes();
  }

  void _handleNodeTap(String name) {
    // Find the flyer by node name
    final flyer = widget.arFlyers.firstWhere(
      (f) => f['id'] == name,
      orElse: () => {},
    );
    
    if (flyer.isNotEmpty) {
      widget.onFlyerTapped(flyer);
    }
  }

  void _addARNodes() {
    for (var arFlyer in widget.arFlyers) {
      final position = arFlyer['arPosition'] as vector.Vector3;
      
      // Create material with gold color
      final material = ArCoreMaterial(
        color: const Color.fromARGB(255, 245, 166, 35),
        metallic: 0.8,
        roughness: 0.2,
      );
      
      // Create sphere shape
      final sphere = ArCoreSphere(
        materials: [material],
        radius: 0.15,
      );
      
      // Create text (store name)
      final textMaterial = ArCoreMaterial(
        color: Colors.white,
      );
      
      // Create AR node
      final node = ArCoreNode(
        name: arFlyer['id'],
        shape: sphere,
        position: position,
        children: [
          // Text label above sphere
          ArCoreNode(
            shape: ArCoreText(
              text: arFlyer['storeName'],
              extrusionDepth: 1,
              materials: [textMaterial],
            ),
            position: vector.Vector3(0, 0.3, 0),
            scale: vector.Vector3(0.05, 0.05, 0.05),
          ),
        ],
      );
      
      arCoreController?.addArCoreNode(node);
      _addedNodes[arFlyer['id']] = node;
    }
  }

  @override
  void dispose() {
    // Remove all nodes
    for (var node in _addedNodes.values) {
      arCoreController?.removeNode(nodeName: node.name!);
    }
    arCoreController?.dispose();
    super.dispose();
  }
}
