import 'package:google_generative_ai/google_generative_ai.dart';
import 'ai_service.dart';

class GeminiService implements AiService {
  // WARNING: API keys should not be hardcoded in production apps.
  // Consider using environment variables or a secure secrets management solution.
  static const String _apiKey = 'AIzaSyCz-0--zefsIBwn5bRscjbhRv0DaNnlz9Q'; // TODO: Replace with your actual API key

  GenerativeModel? _model;
  GenerativeModel? _visionModel;

  GeminiService() {
    if (_apiKey == 'AIzaSyCz-0--zefsIBwn5bRscjbhRv0DaNnlz9Q') {
      print('**********************************************************************');
      print('* WARNING: Gemini API Key is not set in lib/services/gemini_service.dart *');
      print('* Please replace YOUR_API_KEY_HERE with your actual Gemini API key.   *');
      print('* Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey *');
      print('**********************************************************************');
      // You might want to throw an exception or handle this more gracefully
      // depending on your application's requirements.
    } else {
      _model = GenerativeModel(model: 'gemini-pro', apiKey: _apiKey);
      // For image generation/understanding, you might use a different model
      // e.g., 'gemini-pro-vision' or a specific Imagen model if the library supports it directly.
      // For now, let's assume gemini-pro can handle multimodal if prompted correctly, or we use a vision-specific one.
      _visionModel = GenerativeModel(model: 'gemini-pro-vision', apiKey: _apiKey);
    }
  }

  @override
  Future<String?> generateText(String prompt) async {
    if (_model == null) {
      print('Gemini text model not initialized. API Key might be missing.');
      return 'Error: Gemini model not initialized. Check API Key.';
    }
    try {
      final content = [Content.text(prompt)];
      final response = await _model!.generateContent(content);
      return response.text;
    } catch (e) {
      print('Error generating text with Gemini: $e');
      return 'Error generating text: ${e.toString()}';
    }
  }

  @override
  Future<String?> generateImagePromptSuggestion(String storyContext) async {
    if (_model == null) {
       print('Gemini text model not initialized. API Key might be missing.');
      return 'Error: Gemini model not initialized. Check API Key.';
    }
    final prompt = '''Based on the following story context for a children\'s book/comic,
        suggest a detailed and vivid visual prompt for an AI image generator.
        The prompt should be suitable for creating an illustration that fits the story.
        Story context: "$storyContext"
        Detailed visual prompt suggestion:''';

    try {
      final content = [Content.text(prompt)];
      final response = await _model!.generateContent(content);
      return response.text;
    } catch (e) {
      print('Error generating image prompt suggestion with Gemini: $e');
      return 'Error generating image prompt: ${e.toString()}';
    }
  }

  // Placeholder for actual image generation if the library/model supports it directly.
  // Note: google_generative_ai primarily focuses on text and chat for models like Gemini Pro.
  // Image generation often uses specific Imagen models/APIs.
  // This is a conceptual placeholder for how one might integrate image generation prompts
  // or multimodal capabilities if `gemini-pro-vision` or other models support it via this SDK.
  @override
  Future<String?> generateImageFromPrompt(String imagePrompt) async {
    if (_visionModel == null) {
      print('Gemini vision model not initialized. API Key might be missing.');
      return 'Error: Gemini vision model not initialized. Check API Key.';
    }

    // Simulate an image generation call that returns a placeholder URL
    // In a real scenario, this would be the result of an actual image generation API call
    print('Simulating image generation for prompt: "$imagePrompt"');
    // Use a placeholder image service URL. Let's make it somewhat dynamic based on the prompt length for variety.
    final placeholderSize = 150 + (imagePrompt.length % 50); // Simple dynamic size
    final placeholderUrl = 'https://via.placeholder.com/${placeholderSize}/09f/fff?text=AI+Image+For+' + Uri.encodeComponent(imagePrompt.substring(0, imagePrompt.length > 20 ? 20 : imagePrompt.length));

    // Simulate a delay as if an API call was made
    await Future.delayed(const Duration(seconds: 1)); 

    // For demonstration, we'll directly return a placeholder URL.
    // Actual Gemini image generation might involve different models or the Vertex AI SDK
    // and could return base64 data or a signed URL.
    // This response.text is a simplification based on current google_generative_ai capabilities for text primarily.
    // final prompt = 'Generate an image based on the following description: "$imagePrompt". Respond with a (simulated) image URL or base64 string.';
    // try {
    //   final content = [Content.text(prompt)]; 
    //   final response = await _visionModel!.generateContent(content);

    //   if (response.text != null && response.text!.isNotEmpty) {
    //     print('Simulated image generation response: ${response.text}');
    //     return placeholderUrl; // Return the placeholder URL
    //   } else {
    //     return 'Error: No image data received (or model does not support direct image generation this way).';
    //   }
    // } catch (e) {
    //   print('Error generating image with Gemini: $e');
    //   return 'Error generating image: ${e.toString()}';
    // }
    return placeholderUrl; // Directly return the constructed placeholder URL
  }
} 