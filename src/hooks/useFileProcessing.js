import React from 'react' 
import { PDFProcessingService } from '../services/pdfProcessingService'
import { AIProcessingService } from '../services/aiProcessingService'
import { FileManagementService } from '../services/fileManagementService'
import { CacheService } from '../services/cacheService'
import toast from 'react-hot-toast'
import { FileText, X, CheckCircle, Sparkles } from 'lucide-react'

export const useFileProcessing = (state) => {
  const {
    setIsExtracting,
    setIsOCRProcessing,
    setIsAutoProcessing,
    setOverallProgress,
    setExtractionStatus,
    setProcessingProgress,
    setExtractedText,
    setErrorMessage,
    setCleanedQuestions,
    setActiveSection,
    geminiApiKey,
    setFileHashes, // Add this to store file hashes for caching
    isProcessingWithGemini,
    setIsProcessingWithGemini
  } = state

  const processMultiplePDFs = async (files) => {
    setIsExtracting(true)
    setIsOCRProcessing(false)
    setIsAutoProcessing(false)
    setOverallProgress(0)
    setExtractionStatus(`Starting to process ${files.length} PDF files...`)
    
    // Initialize progress tracking for each file
    const initialProgress = FileManagementService.initializeFileProgress(files)
    setProcessingProgress(initialProgress)
    
    try {
      // Process all files in parallel
      const processingPromises = files.map((file, index) => 
        PDFProcessingService.extractTextFromSinglePDF(
          file, 
          index, 
          files.length,
          (fileName, progress) => {
            if (fileName === 'overall') {
              setOverallProgress(progress)
            } else {
              setProcessingProgress(prev => ({
                ...prev,
                [fileName]: progress
              }))
            }
          }
        )
      )
      
      const results = await Promise.allSettled(processingPromises)
      
      // Combine all successful results
      const combinedResult = FileManagementService.combineFileResults(results, files)
      
      if (combinedResult.hasContent) {
        setExtractedText(combinedResult.combinedText)
        setExtractionStatus(`Successfully processed ${combinedResult.successCount} of ${files.length} PDF files!`)
        
        // Show success notification for file processing
        toast.success(`Successfully processed ${combinedResult.successCount} of ${files.length} PDF files!`, {
          duration: 3000,
          icon: React.createElement(FileText, { size: 16 }),
        })
        
        // Show AI cleaning toast after success toast
        setTimeout(() => {
          toast.loading('Cleaning text with AI...', {
            id: 'ai-cleaning',
            icon: React.createElement(Sparkles, { size: 16 }),
          })
        }, 3000)
        
        // Automatically process combined text with AI
        await autoProcessWithGemini(combinedResult.combinedText)
      } else {
        setErrorMessage(`Failed to extract text from all ${files.length} PDF files.`)
        toast.error(`Failed to extract text from all ${files.length} PDF files.`, {
        duration: 5000,
        icon: React.createElement(X, { size: 16 }),
        })
      }
      
      setOverallProgress(100)
      
    } catch (error) {
      console.error('Error processing multiple PDFs:', error)
      setErrorMessage(`Error processing PDF files: ${error.message}`)
    } finally {
      setIsExtracting(false)
      setIsOCRProcessing(false)
    }
  }



  const autoProcessWithGemini = async (text) => {
    if (!geminiApiKey.trim()) {
      setErrorMessage('Please enter your Google Gemini API key to automatically process the extracted text.')
      return
    }

    // Prevent duplicate processing
    if (isProcessingWithGemini) {
      console.log('AI processing already in progress, skipping duplicate call')
      return
    }

    setIsAutoProcessing(true)
    setIsProcessingWithGemini(true)
    setErrorMessage('')
    
    // Dismiss OCR processing toast when AI processing starts
    toast.dismiss('ocr-processing')

    try {
      const cleanedText = await AIProcessingService.processTextWithGemini(
        text,
        geminiApiKey,
        (status) => setExtractionStatus(status)
      )

      setCleanedQuestions(cleanedText)
      // Dismiss AI cleaning toast when processing is complete
      toast.dismiss('ai-cleaning')
      // Navigate to questions section after successful processing
      setTimeout(() => setActiveSection('questions'), 2000)
    } catch (error) {
      setErrorMessage(error.message)
      // Dismiss AI cleaning toast on error
      toast.dismiss('ai-cleaning')
    } finally {
      setIsAutoProcessing(false)
      setIsProcessingWithGemini(false)
    }
  }

  const processTextWithGemini = async (text) => {
    if (!geminiApiKey.trim()) {
      setErrorMessage('Please enter your Google Gemini API key to process the text.')
      return
    }

    // Prevent duplicate processing
    if (isProcessingWithGemini) {
      console.log('AI processing already in progress, skipping duplicate call')
      return
    }

    setIsProcessingWithGemini(true)
    setErrorMessage('')

    try {
      const cleanedText = await AIProcessingService.processTextWithGemini(
        text,
        geminiApiKey,
        (status) => setExtractionStatus(status)
      )

      setCleanedQuestions(cleanedText)
      // Show success notification
      toast.dismiss('reprocess')
      toast.dismiss('clean-ai')
      toast.success('Processing completed! Questions have been cleaned and formatted.', {
        duration: 4000
      })
      // Navigate to questions section after successful processing
      setTimeout(() => setActiveSection('questions'), 2000)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsProcessingWithGemini(false)
    }
  }

  return {
    processMultiplePDFs,
    processTextWithGemini
  }
}