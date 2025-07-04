import { 
  FileText, 
  Copy, 
  RefreshCw, 
  Search, 
  Loader2,
  Upload,
  CheckCircle 
} from 'lucide-react'
import toast from 'react-hot-toast'

const QuestionsList = ({ 
  cleanedQuestions, 
  extractedText,
  onProcessWithGemini, 
  onAnalyzeQuestions,
  isProcessingWithGemini, 
  isGroupingQuestions,
  geminiApiKey,
  onNavigateToUpload,
  groupedQuestions 
}) => {
  if (!cleanedQuestions) {
    return (
      <div className="section-content">
        {/* <h2 className="section-title">🧠 Extracted Questions</h2>
        <p className="section-subtitle">AI-processed questions from your documents</p> */}
        
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <h3>No Questions Available</h3>
          <p>Upload and process PDF files to see extracted questions here.</p>
          <button 
            className="nav-btn"
            onClick={onNavigateToUpload}
          >
            Go to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="section-content">
      {/* <h2 className="section-title">🧠 Extracted Questions</h2>
      <p className="section-subtitle">AI-processed questions from your documents</p> */}
      
      <div className="cleaned-questions-section">
        <h2>
          <FileText size={24} />
          Extracted Questions
        </h2>
        <div className="cleaned-questions-container">
          <div className="text-controls">
            <button 
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(cleanedQuestions)
                toast.success('Questions copied to clipboard!')
              }}
              title="Copy questions to clipboard"
            >
              <Copy size={16} />
              Copy Questions
            </button>
            
            <button 
              className="process-gemini-btn"
              onClick={() => {
                toast.loading('Re-processing questions with AI...', { id: 'reprocess' })
                onProcessWithGemini(extractedText)
              }}
              title="Re-process with AI if needed"
              disabled={!extractedText || isProcessingWithGemini || !geminiApiKey.trim()}
            >
              {isProcessingWithGemini ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Re-processing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Re-process
                </>
              )}
            </button>
            
            <button 
              className="analyze-btn"
              onClick={() => {
                toast.loading('Analyzing questions...', { id: 'analyze' })
                onAnalyzeQuestions(cleanedQuestions)
              }}
              title="Analyze questions for similarity and group them"
              disabled={!cleanedQuestions || isGroupingQuestions}
            >
              {isGroupingQuestions ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze & Group Questions
                </>
              )}
            </button>
          </div>
          
          <div className="cleaned-questions-text">
            <pre>{cleanedQuestions}</pre>
          </div>
        </div>
      </div>


    </div>
  )
}

export default QuestionsList