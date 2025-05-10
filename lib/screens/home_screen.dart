import 'package:fl_writer/models/page_model.dart';
import 'package:fl_writer/services/ai_service.dart';
import 'package:fl_writer/services/gemini_service.dart';
import 'package:fl_writer/services/local_storage_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:fl_writer/widgets/drawing_canvas.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late QuillController _quillController;
  late AiService _aiService;
  late LocalStorageService _localStorageService;
  bool _isLoadingGemini = false;
  bool _isLoadingStorage = false;

  List<PageModel> _pages = [];
  int _currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    _aiService = GeminiService();
    _localStorageService = LocalStorageService();
    _quillController = QuillController.basic();
    _loadProject();
  }

  Future<void> _loadProject() async {
    setState(() {
      _isLoadingStorage = true;
    });
    List<PageModel> loadedPages = await _localStorageService.loadPages();
    if (mounted) {
      setState(() {
        if (loadedPages.isNotEmpty) {
          _pages = loadedPages;
          _currentPageIndex = 0;
        } else {
          _pages = [PageModel.empty()];
          _currentPageIndex = 0;
        }
        _quillController.document = _pages[_currentPageIndex].content.isEmpty
            ? Document()
            : Document.fromJson(_pages[_currentPageIndex].content.toDelta().toJson());
        _quillController.moveCursorToEnd();
        _isLoadingStorage = false as bool;
      });
    }
  }

  Future<void> _saveProject() async {
    if (_pages.isEmpty) return;
    _saveCurrentPageContent();
    setState(() {
      _isLoadingStorage = true;
    });
    await _localStorageService.savePages(_pages);
    if (mounted) {
      setState(() {
        _isLoadingStorage = false as bool;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Project saved locally!')),
      );
    }
  }

  Future<void> _clearLocalDataAndReset() async {
    setState(() {
      _isLoadingStorage = true;
    });
    await _localStorageService.clearAllData();
    if (mounted) {
      setState(() {
        _pages = [PageModel.empty()];
        _currentPageIndex = 0;
        _quillController.document = Document();
        _quillController.moveCursorToEnd();
        _isLoadingStorage = false as bool;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Local data cleared and project reset.')),
      );
    }
  }

  @override
  void dispose() {
    _saveProject();
    _quillController.dispose();
    super.dispose();
  }

  void _saveCurrentPageContent() {
    if (_pages.isNotEmpty && _currentPageIndex < _pages.length) {
      _pages[_currentPageIndex].content = Document.fromJson(_quillController.document.toDelta().toJson());
      // Drawing data is now saved via the onDrawingUpdated callback from DrawingCanvas
      // So, no explicit save of drawing data here is needed unless it was modified outside the canvas.
    }
  }

  void _addNewPage() {
    _saveCurrentPageContent();
    setState(() {
      _pages.add(PageModel.empty());
      _currentPageIndex = _pages.length - 1;
      _quillController.document = Document();
      _quillController.moveCursorToEnd();
    });
    _saveProject();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Added new page. Now on page ${_currentPageIndex + 1}')),
    );
  }

  void _goToPage(int index) {
    if (index >= 0 && index < _pages.length) {
      _saveCurrentPageContent();
      setState(() {
        _currentPageIndex = index;
        _quillController.document = _pages[_currentPageIndex].content.isEmpty
            ? Document()
            : Document.fromJson(_pages[_currentPageIndex].content.toDelta().toJson());
        _quillController.moveCursorToEnd();
        // DrawingCanvas will be rebuilt with new initialStrokes due to setState
        // and its didUpdateWidget will handle updating its internal _strokes.
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Switched to page ${_currentPageIndex + 1}')),
      );
    }
  }

  Future<void> _getWritingPrompt() async {
    setState(() {
      _isLoadingGemini = true;
    });
    final currentText = _quillController.document.toPlainText();
    final prompt = currentText.trim().isEmpty
        ? 'Generate a creative writing prompt for a children\'s story or comic.'
        : 'Based on the following text, generate a new creative writing prompt to continue the story for a children\'s book or comic: "${currentText.substring(0, currentText.length > 500 ? 500 : currentText.length)}"...';

    final result = await _aiService.generateText(prompt);

    if (mounted) {
      if (result != null && !result.startsWith('Error:')) {
        final index = _quillController.selection.baseOffset;
        final length = _quillController.selection.extentOffset - index;
        _quillController.replaceText(index, length, '\n--- Suggested Prompt ---\n$result\n---\n', null);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Writing prompt generated!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result ?? 'Failed to get writing prompt.')),
        );
      }
      setState(() {
        _isLoadingGemini = false as bool;
      });
    }
    _saveProject();
  }

  Future<void> _assistWriting() async {
    setState(() {
      _isLoadingGemini = true;
    });
    final currentText = _quillController.document.toPlainText().trim();
    if (currentText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write some text first to get assistance.')),
      );
      setState(() {
        _isLoadingGemini = false as bool;
      });
      return;
    }

    final prompt = 'Continue writing the following children\'s story/comic text, adding a few more sentences or a short paragraph. Keep the tone and style consistent: "${currentText.substring(0, currentText.length > 1000 ? 1000 : currentText.length)}"...';
    final result = await _aiService.generateText(prompt);

    if (mounted) {
      if (result != null && !result.startsWith('Error:')) {
        _quillController.moveCursorToEnd();
        _quillController.document.insert(_quillController.selection.extentOffset, '\n$result');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Writing assistance provided!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result ?? 'Failed to assist writing.')),
        );
      }
      setState(() {
        _isLoadingGemini = false as bool;
      });
    }
    _saveProject();
  }

  Future<void> _generateImage() async {
    setState(() {
      _isLoadingGemini = true;
    });
    final storyContext = _quillController.document.toPlainText().trim();
    if (storyContext.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please write some story context to generate an image idea.')),
      );
       setState(() {
        _isLoadingGemini = false as bool;
      });
      return;
    }

    final imagePromptSuggestion = await _aiService.generateImagePromptSuggestion(storyContext);

    if (mounted && (imagePromptSuggestion == null || imagePromptSuggestion.startsWith('Error:'))) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(imagePromptSuggestion ?? 'Failed to get image prompt suggestion.')),
      );
      setState(() {
        _isLoadingGemini = false as bool;
      });
      return;
    }

    if (mounted && imagePromptSuggestion != null) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Image Prompt Idea: $imagePromptSuggestion. Actual generation placeholder.'), duration: const Duration(seconds: 5)),
        );
        final imageDataResponse = await _aiService.generateImageFromPrompt(imagePromptSuggestion);
         if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(imageDataResponse ?? 'Failed to simulate image generation.'), duration: const Duration(seconds: 3)),
            );
            if (imageDataResponse != null && !imageDataResponse.startsWith('Error:')) {
              setState(() { 
                 if (_pages.isNotEmpty && _currentPageIndex < _pages.length) {
                    _pages[_currentPageIndex].imageData = imageDataResponse; 
                    print('Stored image data for page ${_currentPageIndex + 1}: $imageDataResponse'); 
                    _saveProject();
                 }
              });
            }
        }
    } else if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not generate an image prompt suggestion.')),
        );
    }

    if (mounted) {
      setState(() {
        _isLoadingGemini = false as bool;
      });
    }
  }

  Future<void> _deleteCurrentPage() async {
    if (_pages.length <= 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cannot delete the last page.')),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Delete Page'),
          content: Text('Are you sure you want to delete page ${_currentPageIndex + 1}?'),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(false),
            ),
            TextButton(
              child: const Text('Delete', style: TextStyle(color: Colors.red)),
              onPressed: () => Navigator.of(context).pop(true),
            ),
          ],
        );
      },
    );

    if (confirm == true) {
      setState(() {
        _pages.removeAt(_currentPageIndex);
        if (_currentPageIndex >= _pages.length) {
          _currentPageIndex = _pages.length - 1;
        }
        if (_pages.isEmpty) { // Should not happen due to the guard above, but as a fallback
          _pages.add(PageModel.empty());
          _currentPageIndex = 0;
        }
        // Load the content of the new current page
        _quillController.document = _pages[_currentPageIndex].content.isEmpty
            ? Document()
            : Document.fromJson(_pages[_currentPageIndex].content.toDelta().toJson());
        _quillController.moveCursorToEnd();
      });
      await _saveProject(); // Save after deleting a page
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Page deleted. Now on page ${_currentPageIndex + 1}')),
        );
      }
    }
  }

  Future<void> _movePageLeft() async {
    if (_currentPageIndex > 0) {
      _saveCurrentPageContent(); // Save content before moving
      setState(() {
        final PageModel currentPage = _pages.removeAt(_currentPageIndex);
        _pages.insert(_currentPageIndex - 1, currentPage);
        _currentPageIndex--;
        // QuillController already displays the content of the page that was moved,
        // so no need to reload it. Its index has just changed.
      });
      await _saveProject();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Page ${_currentPageIndex + 2} moved left to position ${_currentPageIndex + 1}')),
        );
      }
    }
  }

  Future<void> _movePageRight() async {
    if (_currentPageIndex < _pages.length - 1) {
      _saveCurrentPageContent(); // Save content before moving
      setState(() {
        final PageModel currentPage = _pages.removeAt(_currentPageIndex);
        _pages.insert(_currentPageIndex + 1, currentPage);
        _currentPageIndex++;
        // QuillController already displays the content of the page that was moved.
      });
      await _saveProject();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Page ${_currentPageIndex} moved right to position ${_currentPageIndex + 1}')),
        );
      }
    }
  }

  // Callback for when drawing is updated in DrawingCanvas
  void _onPageDrawingUpdated(List<StrokeSegment> updatedStrokes) {
    if (_pages.isNotEmpty && _currentPageIndex < _pages.length) {
      setState(() {
        // Create new list instances to ensure change detection if PageModel or StrokeSegment are not fully immutable
        _pages[_currentPageIndex].drawingStrokes = updatedStrokes.map((s) => StrokeSegment(points: List<Offset?>.from(s.points))).toList();
      });
      _saveProject(); // Save project whenever drawing is updated
    }
  }

  // Add missing method definition
  Widget _buildPageNavigation() => Container(); // Placeholder, can be expanded later

  Widget _buildEditorSection() {
    // Determine if the editor should be read-only based on loading states.
    final bool isEditorReadOnly = _isLoadingGemini || _isLoadingStorage;

    return Column(
      children: [
        _buildPageNavigation(), // Call to the now defined method
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Wrap(
            spacing: 8.0,
            runSpacing: 4.0,
            children: [
              ElevatedButton.icon(
                icon: _isLoadingGemini ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.lightbulb_outline),
                label: const Text("Get Prompt Idea"),
                onPressed: isEditorReadOnly ? null : _getWritingPrompt,
              ),
              ElevatedButton.icon(
                icon: _isLoadingGemini ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.edit_note),
                label: const Text("Assist Writing"),
                onPressed: isEditorReadOnly ? null : _assistWriting,
              ),
              ElevatedButton.icon(
                icon: _isLoadingGemini ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.image_search),
                label: const Text("Generate Image Idea"),
                onPressed: isEditorReadOnly ? null : _generateImage,
              ),
              ElevatedButton.icon(
                icon: _isLoadingStorage ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.save),
                label: const Text("Save Project"),
                onPressed: isEditorReadOnly ? null : _saveProject,
              ),
               ElevatedButton.icon(
                icon: _isLoadingStorage ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.delete_forever),
                label: const Text("Clear Local Data"),
                onPressed: isEditorReadOnly ? null : _clearLocalDataAndReset,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
              ),
            ],
          ),
        ),
        // Use direct QuillToolbar.basic and pass properties directly
        QuillToolbar.basic(
          controller: _quillController,
          showAlignmentButtons: true,
          showBackgroundColorButton: true,
          showBoldButton: true,
          showCenterAlignment: true,
          showClearFormat: true,
          showCodeBlock: true,
          showColorButton: true,
          showDirection: false, 
          showDividers: true,
          showFontFamily: true,
          showFontSize: true,
          showHeaderStyle: true,
          showIndent: true,
          showInlineCode: true,
          showItalicButton: true,
          showJustifyAlignment: true,
          showLeftAlignment: true,
          showLink: true,
          showListBullets: true,
          showListCheck: true,
          showListNumbers: true,
          showQuote: true,
          showRightAlignment: true,
          showSearchButton: true,
          showSmallButton: true, // Assuming this was intended, controls 'small' text style
          showStrikeThrough: true,
          showSubscript: false, 
          showSuperscript: false, 
          showUnderlineButton: true,
          // Ensure no duplicated showAlignmentButtons here from previous attempts
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            // Use direct QuillEditor.basic (readOnly parameter removed as it caused errors)
            child: QuillEditor.basic(
              controller: _quillController,
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingStorage && _pages.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(semanticsLabel: "Loading project...")),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text('AI Creative Studio - Page ${_currentPageIndex + 1} of ${_pages.length}'),
        actions: [
          if (_isLoadingStorage) IconButton(icon: const SizedBox(width:20, height:20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white,)), onPressed: null, tooltip: "Saving..."),
          IconButton(
            icon: const Icon(Icons.save_outlined),
            tooltip: 'Save Project Locally',
            onPressed: _isLoadingStorage ? null : _saveProject,
          ),
          IconButton(
            icon: const Icon(Icons.delete_forever_outlined),
            tooltip: 'Clear Local Data & Reset',
            onPressed: _isLoadingStorage ? null : () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text('Confirm Clear Data'),
                    content: const Text('Are you sure you want to clear all locally saved project data? This cannot be undone.'),
                    actions: <Widget>[
                      TextButton(
                        child: const Text('Cancel'),
                        onPressed: () => Navigator.of(context).pop(false),
                      ),
                      TextButton(
                        child: const Text('Clear Data'),
                        onPressed: () => Navigator.of(context).pop(true),
                      ),
                    ],
                  );
                },
              );
              if (confirm == true) {
                _clearLocalDataAndReset();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.cloud_upload_outlined),
            tooltip: 'Save to Google Drive (Not Implemented)',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Google Drive Save: Not Implemented Yet')),
              );
            },
          ),
        ],
      ),
      body: Row(
        children: [
          Expanded(
            flex: 2,
            child: _buildEditorSection(),
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                children: [
                  const Text(
                    'Illustration Canvas & AI Images',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (_pages.isNotEmpty &&
                      _currentPageIndex < _pages.length &&
                      _pages[_currentPageIndex].imageData != null &&
                      Uri.tryParse(_pages[_currentPageIndex].imageData!)?.hasAbsolutePath == true)
                    Container(
                      margin: const EdgeInsets.only(bottom: 8.0),
                      padding: const EdgeInsets.all(4.0),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.blueAccent),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      constraints: const BoxConstraints(maxHeight: 150),
                      child: InteractiveViewer(
                        child: Image.network(
                          _pages[_currentPageIndex].imageData!,
                          loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Center(
                              child: CircularProgressIndicator(
                                value: loadingProgress.expectedTotalBytes != null
                                    ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                    : null,
                              ),
                            );
                          },
                          errorBuilder: (BuildContext context, Object exception, StackTrace? stackTrace) {
                            return const Center(child: Text('Could not load image', style: TextStyle(color: Colors.red)));
                          },
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: DrawingCanvas(
                        key: ValueKey(_pages[_currentPageIndex].id), // Ensures canvas rebuilds on page change for new strokes
                        initialStrokes: _pages.isNotEmpty && _currentPageIndex < _pages.length 
                                          ? _pages[_currentPageIndex].drawingStrokes 
                                          : [],
                        onDrawingUpdated: _onPageDrawingUpdated, 
                      ), 
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.image_search),
                    label: const Text('Generate Image (Gemini)'),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Gemini Image Generation: Not Implemented Yet')),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: Container(
          height: 50.0,
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new),
                tooltip: 'Previous Page',
                onPressed: _currentPageIndex > 0 ? () => _goToPage(_currentPageIndex - 1) : null,
              ),
              Text('Page ${_currentPageIndex + 1} / ${_pages.length}'),
              IconButton(
                icon: const Icon(Icons.arrow_forward_ios),
                tooltip: 'Next Page',
                onPressed: _currentPageIndex < _pages.length - 1 ? () => _goToPage(_currentPageIndex + 1) : null,
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.keyboard_arrow_left),
                tooltip: 'Move Page Left',
                onPressed: (_pages.length > 1 && _currentPageIndex > 0 && !_isLoadingStorage) 
                           ? _movePageLeft 
                           : null,
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.add_box_outlined),
                label: const Text('New Page'),
                onPressed: _isLoadingStorage ? null : _addNewPage,
              ),
              IconButton(
                icon: const Icon(Icons.keyboard_arrow_right),
                tooltip: 'Move Page Right',
                onPressed: (_pages.length > 1 && _currentPageIndex < _pages.length - 1 && !_isLoadingStorage)
                           ? _movePageRight
                           : null,
              ),
              const SizedBox(width: 10),
              if (_pages.length > 1)
                IconButton(
                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                  tooltip: 'Delete Current Page',
                  onPressed: _isLoadingStorage ? null : _deleteCurrentPage,
                ),
            ],
          ),
        ),
      ),
    );
  }
} 