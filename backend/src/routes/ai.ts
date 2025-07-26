import { Router, Request, Response } from 'express';
import { authenticate, checkUsageLimit } from '../middleware/auth';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { getChatCompletion, generateCode, analyzeText, generateCreativeContent, getAvailableModels } from '../services/openai';

const router = Router();
router.use(authenticate);

// Get available AI models
router.get('/models', catchAsync(async (req: Request, res: Response) => {
  const models = await getAvailableModels();
  
  res.json({
    status: 'success',
    data: { models }
  });
}));

// Generate code
router.post('/generate-code', checkUsageLimit('aiTokens'), catchAsync(async (req: Request, res: Response) => {
  const { prompt, language = 'javascript' } = req.body;
  
  if (!prompt) {
    throw new AppError('Prompt is required', 400);
  }

  const result = await generateCode(prompt, language, req.user!._id.toString());

  res.json({
    status: 'success',
    data: { result }
  });
}));

// Analyze text
router.post('/analyze-text', checkUsageLimit('aiTokens'), catchAsync(async (req: Request, res: Response) => {
  const { text, analysisType = 'summary' } = req.body;
  
  if (!text) {
    throw new AppError('Text is required', 400);
  }

  const result = await analyzeText(text, analysisType, req.user!._id.toString());

  res.json({
    status: 'success',
    data: { result }
  });
}));

// Generate creative content
router.post('/generate-content', checkUsageLimit('aiTokens'), catchAsync(async (req: Request, res: Response) => {
  const { prompt, contentType = 'article' } = req.body;
  
  if (!prompt) {
    throw new AppError('Prompt is required', 400);
  }

  const result = await generateCreativeContent(prompt, contentType, req.user!._id.toString());

  res.json({
    status: 'success',
    data: { result }
  });
}));

export default router;