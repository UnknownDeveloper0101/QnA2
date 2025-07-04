import { AIProcessingService } from '../services/aiProcessingService'
import toast from 'react-hot-toast'

export const useQuestionAnalysis = (state) => {
  const {
    setGroupedQuestions,
    setIsGroupingQuestions,
    setErrorMessage,
    setExtractionStatus,
    setActiveSection,
    geminiApiKey,
    setAnswers,
    setLoadingAnswers,
    setHiddenAnswers
  } = state

  const analyzeQuestions = async (cleanedText) => {
    if (!cleanedText || cleanedText.trim().length === 0) {
      setGroupedQuestions([])
      return
    }

    if (!geminiApiKey.trim()) {
      setErrorMessage('Please enter your Google Gemini API key to analyze questions.')
      return
    }

    try {
      setIsGroupingQuestions(true)
      setErrorMessage('')
      
      // Show analyzing questions toast
      toast.loading('Analyzing questions...', {
        id: 'analyze',
        duration: Infinity,
      })
      
      // Clear previous answers when analyzing new questions
      setAnswers({})
      setLoadingAnswers({})
      setHiddenAnswers({})

      const groups = await AIProcessingService.analyzeQuestions(
        cleanedText,
        geminiApiKey,
        (status) => setExtractionStatus(status)
      )
      
      setGroupedQuestions(groups)
      // Show success notification
      toast.dismiss('analyze')
      toast.success('Analysis completed! Questions have been grouped successfully.', {
        duration: 4000
      })
      // Navigate to analysis section after successful analysis
      setTimeout(() => setActiveSection('analysis'), 2000)
      
    } catch (error) {
      setErrorMessage(error.message)
      // Dismiss analyzing toast on error
      toast.dismiss('analyze')
    } finally {
      setIsGroupingQuestions(false)
    }
  }

  return {
    analyzeQuestions
  }
}