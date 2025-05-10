import 'dart:convert';
import 'package:fl_writer/models/page_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String _pagesKey = 'project_pages';

  Future<void> savePages(List<PageModel> pages) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> pagesJson = pages.map((page) => jsonEncode(page.toJson())).toList();
    await prefs.setStringList(_pagesKey, pagesJson);
    print('Pages saved to local storage: ${pagesJson.length} pages');
  }

  Future<List<PageModel>> loadPages() async {
    final prefs = await SharedPreferences.getInstance();
    List<String>? pagesJson = prefs.getStringList(_pagesKey);

    if (pagesJson != null && pagesJson.isNotEmpty) {
      try {
        List<PageModel> loadedPages = pagesJson.map((pageString) {
          return PageModel.fromJson(jsonDecode(pageString) as Map<String, dynamic>);
        }).toList();
        print('Pages loaded from local storage: ${loadedPages.length} pages');
        return loadedPages;
      } catch (e) {
        print('Error decoding pages from local storage: $e');
        // Could clear corrupted data if necessary
        // await prefs.remove(_pagesKey);
        return []; // Return empty list on error
      }
    } else {
      print('No pages found in local storage.');
      return []; // Return empty list if no data
    }
  }

  Future<void> clearAllData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_pagesKey);
    // You could add other keys to clear here if needed
    print('All project data cleared from local storage.');
  }
} 