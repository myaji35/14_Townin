import 'dart:io';
import 'package:flutter/material.dart';
import 'package:arkit_plugin/arkit_plugin.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

/// iOS ARKit View Implementation
class IOSARView extends StatefulWidget {
  final Function(Map<String, dynamic>) onFlyerTapped;
  final List<Map<String, dynamic>> arFlyers;

  const IOSARView({
    super.key,
    required this.onFlyerTapped,
    required this.arFlyers,
  });

  @override
  State<IOSARView> createState() => _IOSARViewState();
}

class _IOSARViewState extends State<IOSARView> {
  ARKitController? arkitController;
  final Map<String, String> _nodeIdToFlyerId = {};

  @override
  Widget build(BuildContext context) {
    return ARKitSceneView(
      onARKitViewCreated: _onARKitViewCreated,
      enableTapRecognizer: true,
    );
  }

  void _onARKitViewCreated(ARKitController controller) {
    arkitController = controller;
    controller.onNodeTap = _handleNodeTap;
    _addARNodes();
  }

  void _handleNodeTap(List<String> nodeNames) {
    if (nodeNames.isEmpty) return;
    
    final nodeName = nodeNames.first;
    final flyerId = _nodeIdToFlyerId[nodeName];
    
    if (flyerId != null) {
      final flyer = widget.arFlyers.firstWhere(
        (f) => f['id'] == flyerId,
        orElse: () => {},
      );
      
      if (flyer.isNotEmpty) {
        widget.onFlyerTapped(flyer);
      }
    }
  }

  void _addARNodes() {
    for (var arFlyer in widget.arFlyers) {
      final position = arFlyer['arPosition'] as vector.Vector3;
      
      // Create sphere geometry
      final sphere = ARKitSphere(
        radius: 0.15,
        materials: [
          ARKitMaterial(
            diffuse: ARKitMaterialProperty.color(
              const Color.fromARGB(255, 245, 166, 35),
            ),
            metalness: ARKitMaterialProperty.value(0.8),
            roughness: ARKitMaterialProperty.value(0.2),
          ),
        ],
      );
      
      // Create text geometry
      final text = ARKitText(
        text: arFlyer['storeName'],
        extrusionDepth: 1,
        materials: [
          ARKitMaterial(
            diffuse: ARKitMaterialProperty.color(Colors.white),
          ),
        ],
      );
      
      // Create sphere node
      final sphereNode = ARKitNode(
        geometry: sphere,
        position: position,
      );
      
      // Create text node (above sphere)
      final textNode = ARKitNode(
        geometry: text,
        position: vector.Vector3(position.x, position.y + 0.3, position.z),
        scale: vector.Vector3(0.05, 0.05, 0.05),
      );
      
      // Add nodes
      arkitController?.add(sphereNode);
      arkitController?.add(textNode);
      
      // Store mapping
      _nodeIdToFlyerId[sphereNode.name] = arFlyer['id'];
    }
  }

  @override
  void dispose() {
    arkitController?.dispose();
    super.dispose();
  }
}
