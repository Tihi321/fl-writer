import 'package:fl_writer/models/page_model.dart'; // Import PageModel for StrokeSegment
import 'package:flutter/material.dart';

// Painter to draw the strokes
class DrawingPainter extends CustomPainter {
  final List<StrokeSegment> strokes;

  DrawingPainter({required this.strokes});

  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = Colors.black // Default color for now
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 4.0; // Default stroke width

    for (var stroke in strokes) {
      if (stroke.points.length < 2) continue;
      for (int i = 0; i < stroke.points.length - 1; i++) {
        if (stroke.points[i] != null && stroke.points[i + 1] != null) {
          canvas.drawLine(stroke.points[i]!, stroke.points[i + 1]!, paint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant DrawingPainter oldDelegate) {
    return oldDelegate.strokes != strokes;
  }
}

class DrawingCanvas extends StatefulWidget {
  final List<StrokeSegment> initialStrokes;
  final Function(List<StrokeSegment> updatedStrokes) onDrawingUpdated;

  const DrawingCanvas({
    super.key,
    required this.initialStrokes,
    required this.onDrawingUpdated,
  });

  @override
  State<DrawingCanvas> createState() => _DrawingCanvasState();
}

class _DrawingCanvasState extends State<DrawingCanvas> {
  late List<StrokeSegment> _strokes;
  StrokeSegment? _currentStroke;

  @override
  void initState() {
    super.initState();
    // Deep copy the initial strokes to allow local modifications
    _strokes = widget.initialStrokes.map((s) => StrokeSegment(points: List<Offset?>.from(s.points))).toList();
  }

 @override
  void didUpdateWidget(covariant DrawingCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If the initial strokes from the parent have changed (e.g., page switch),
    // update the local state. This requires careful comparison or a unique key per page if performance becomes an issue.
    // For now, we assume parent passes a new list instance on page change.
    if (widget.initialStrokes != oldWidget.initialStrokes) { // This might need a more robust check
        _strokes = widget.initialStrokes.map((s) => StrokeSegment(points: List<Offset?>.from(s.points))).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (details) {
        setState(() {
          _currentStroke = StrokeSegment(points: [details.localPosition]);
          _strokes.add(_currentStroke!); 
        });
      },
      onPanUpdate: (details) {
        setState(() {
          _currentStroke?.points.add(details.localPosition);
        });
      },
      onPanEnd: (details) {
        if (_currentStroke != null && _currentStroke!.points.length == 1) {
           // If it was just a tap (single point), add a very small second point to make it visible
           // Or decide to remove it if single taps are not desired
           _currentStroke!.points.add(Offset(_currentStroke!.points.first!.dx + 0.1, _currentStroke!.points.first!.dy + 0.1));
        }
        _currentStroke = null; // Current stroke is finished
        widget.onDrawingUpdated(List<StrokeSegment>.from(_strokes)); // Notify parent of the updated list of strokes
      },
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(4),
          color: Colors.white, 
        ),
        child: CustomPaint(
          painter: DrawingPainter(strokes: _strokes),
          size: Size.infinite,
        ),
      ),
    );
  }
}

// TODO: Implement class MyPainter extends CustomPainter { ... } 