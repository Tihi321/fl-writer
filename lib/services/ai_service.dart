abstract class AiService {
  Future<String?> generateText(String prompt);
  Future<String?> generateImagePromptSuggestion(String storyContext);
  Future<String?> generateImageFromPrompt(String imagePrompt);
  // TODO: Add other common AI interaction methods here as needed
} 