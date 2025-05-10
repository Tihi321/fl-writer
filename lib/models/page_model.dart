import 'package:flutter/material.dart'; // Added for Offset
import 'package:flutter_quill/flutter_quill.dart';

// Custom type for strokes to make JSON serialization cleaner
class StrokeSegment {
  List<Offset?> points;
  // TODO: Add color, strokeWidth, etc. in the future

  StrokeSegment({required this.points});

  Map<String, dynamic> toJson() => {
    'points': points.map((p) => p == null ? null : {'dx': p.dx, 'dy': p.dy}).toList(),
  };

  factory StrokeSegment.fromJson(Map<String, dynamic> json) {
    var pointsList = json['points'] as List<dynamic>; 
    return StrokeSegment(
      points: pointsList.map<Offset?>((p) {
        if (p == null) return null;
        final map = p as Map<String, dynamic>; // Ensure p is treated as a map
        return Offset(map['dx'] as double, map['dy'] as double);
      }).toList(),
    );
  }
}

class PageModel {
  String id;
  Document content; // For Quill editor
  String? imageData; // Placeholder for image path or base64 data
  List<StrokeSegment> drawingStrokes; // Changed from generic list to StrokeSegments
  // TODO: Add more properties like panel layout, illustration layers, etc. later

  PageModel({
    required this.id,
    required this.content,
    this.imageData,
    List<StrokeSegment>? drawingStrokes, // Made optional, defaults to empty
  }) : drawingStrokes = drawingStrokes ?? [];

  // Factory constructor for creating an empty page
  factory PageModel.empty() {
    return PageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(), // Simple unique ID
      content: Document(), // Empty document for Quill
      drawingStrokes: [], // Initialize with empty list
    );
  }

  // Method to convert PageModel to JSON (e.g., for saving)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content.toDelta().toJson(), // Convert Document to JSON Delta
      'imageData': imageData,
      'drawingStrokes': drawingStrokes.map((s) => s.toJson()).toList(), // Serialize strokes
    };
  }

  // Factory constructor to create PageModel from JSON
  factory PageModel.fromJson(Map<String, dynamic> json) {
    var strokesList = json['drawingStrokes'] as List<dynamic>?; // Handle potentially null strokes
    return PageModel(
      id: json['id'] as String,
      content: Document.fromJson(json['content'] as List<dynamic>), // Create Document from JSON Delta
      imageData: json['imageData'] as String?,
      drawingStrokes: strokesList != null 
          ? strokesList.map((s) => StrokeSegment.fromJson(s as Map<String, dynamic>)).toList() 
          : [], // Default to empty list if null
    );
  }
} 