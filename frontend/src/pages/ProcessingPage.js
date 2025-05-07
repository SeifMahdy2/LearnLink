import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  useTheme,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Description as DescriptionIcon,
  QuestionAnswer as QuizIcon,
  MenuBook as ReadingIcon,
  Visibility as VisualIcon,
  Hearing as AudioIcon,
  AccessibilityNew as KinestheticIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { processDocument, generateSummary, generateQuiz, processReadingWriting, processAuditory, processKinesthetic, processVisual, getFileUrl, getVisualConcepts } from '../services/fileService';
import { toast } from 'react-toastify';
import VisualExplanationViewer from '../components/VisualExplanationViewer';
import { processVisualContent, sanitizeVisualExplanations } from '../components/VisualErrorFix';
import { 
  getDefaultLearningStyle, 
  getSubjectPreferences, 
  trackLearningStyleEffectiveness 
} from '../services/userPreferencesService';
import { useAuth } from '../contexts/AuthContext';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: 'auto', overflow: 'visible' }}
    >
      {value === index && (
        <Box sx={{ 
          py: 3,
          height: 'auto',
          overflow: 'visible'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProcessingPage = () => {
  const location = useLocation();
  const { id } = useParams();
  const history = useHistory();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [documentInfo, setDocumentInfo] = useState(null);
  
  // New states for summary and quiz
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizType, setQuizType] = useState('multiple_choice');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [readingWritingContent, setReadingWritingContent] = useState(null);
  const [readingWritingLoading, setReadingWritingLoading] = useState(false);
  const [readingWritingError, setReadingWritingError] = useState(null);
  const [auditoryContent, setAuditoryContent] = useState(null);
  const [auditoryLoading, setAuditoryLoading] = useState(false);
  const [auditoryError, setAuditoryError] = useState(null);
  const [kinestheticContent, setKinestheticContent] = useState(null);
  const [kinestheticLoading, setKinestheticLoading] = useState(false);
  const [kinestheticError, setKinestheticError] = useState(null);
  const [visualContent, setVisualContent] = useState(null);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualError, setVisualError] = useState(null);

  const [processingState, setProcessingState] = useState({
    status: 'loading',
    progress: 0,
    currentStep: 0,
    error: null,
    fileId: null,
    fileName: null,
    resultUrl: null
  });
  
  const { currentUser } = useAuth();
  
  const steps = [
    'Uploading document',
    'Extracting content',
    'Processing learning materials',
    'Finalizing'
  ];
  
  useEffect(() => {
    if (!id) {
      setProcessingState(prev => ({
        ...prev,
        status: 'error',
        error: 'No file ID provided'
      }));
      return;
    }

    // Start processing flow
    setProcessingState(prev => ({
      ...prev,
      fileId: id,
      status: 'processing',
      currentStep: 0
    }));
    
    // Simulate processing steps with timeouts
    const simulateProcessing = () => {
      const timers = [];
      
      // Step 1: Uploading
      timers.push(setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          currentStep: 1,
          progress: 25
        }));
      }, 1500));
      
      // Step 2: Extracting
      timers.push(setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          currentStep: 2,
          progress: 50
        }));
      }, 3000));
      
      // Step 3: Processing
      timers.push(setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          currentStep: 3,
          progress: 75
        }));
      }, 5000));
      
      // Step 4: Finalizing
      timers.push(setTimeout(() => {
        setProcessingState(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          fileName: 'Document_' + id,
          resultUrl: `/documents/${id}`
        }));
      }, 7000));
      
      // Clean up timers on unmount
      return () => timers.forEach(timer => clearTimeout(timer));
    };
    
    const cleanup = simulateProcessing();
    return cleanup;
  }, [id]);
  
  const handleViewResults = () => {
    if (processingState.resultUrl) {
      history.push(processingState.resultUrl);
    }
  };
  
  const handleProcessingError = () => {
    history.push('/upload');
  };
  
  // Create a flag for authentication status instead of early returns
  const isAuthenticated = !!currentUser;
  
  useEffect(() => {
    const fetchDocumentInfo = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await getFileUrl(id);
        if (response.error) {
          setError(response.error);
        } else {
          // Use learning style from location.state if available
          const learningStyle = location.state?.learningStyle || response.learningStyle;
          
          setDocumentInfo({
            id: id,
            name: location.state?.documentName || response.name || `Document ${id}`,
            learningStyle: learningStyle,
            ...response
          });
          
          // If no learning style is set, try to apply default or subject-specific style
          if (!learningStyle) {
            applyPreferredLearningStyle(response.name || `Document ${id}`);
          }
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document information');
      }
    };

    fetchDocumentInfo();
  }, [id, location.state, isAuthenticated]);

  // New function to apply preferred learning style
  const applyPreferredLearningStyle = async (documentName) => {
    try {
      // First, check if a subject-specific style should be applied
      const subjectPreferences = await getSubjectPreferences();
      
      if (subjectPreferences.success && subjectPreferences.subjects) {
        // Check if document name contains any of the subject names
        const matchingSubject = subjectPreferences.subjects.find(subject => 
          documentName.toLowerCase().includes(subject.subject.toLowerCase())
        );
        
        if (matchingSubject) {
          // Apply subject-specific learning style
          setDocumentInfo(prev => ({
            ...prev,
            learningStyle: matchingSubject.learningStyle
          }));
          return;
        }
      }
      
      // If no subject match, apply default learning style
      const defaultStyle = await getDefaultLearningStyle();
      if (defaultStyle.success) {
        setDocumentInfo(prev => ({
          ...prev,
          learningStyle: defaultStyle.defaultStyle
        }));
      }
    } catch (error) {
      console.error('Error applying preferred learning style:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    history.push('/documents');
  };

  const handleProcessWithAI = async () => {
    try {
      setStatus('processing');
      setError('');
      setSummaryLoading(true);
      setQuizLoading(true);
      
      // Set loading state for the selected learning style
      const learningStyle = documentInfo?.learningStyle;
      if (learningStyle === 'reading_writing') {
      setReadingWritingLoading(true);
      } else if (learningStyle === 'auditory') {
      setAuditoryLoading(true);
      } else if (learningStyle === 'kinesthetic') {
        setKinestheticLoading(true);
      } else if (learningStyle === 'visual') {
        setVisualLoading(true);
      }

      // Process document first
      const processResult = await processDocument(id);
      if (!processResult.success) {
        throw new Error(processResult.error || 'Processing failed');
      }

      // Process each content type sequentially to avoid file access conflicts
      try {
        // Generate summary
        const summaryResult = await generateSummary(id);
        if (summaryResult.success) {
          setSummary(summaryResult.summary);
        } else {
          console.error('Summary generation failed:', summaryResult.error);
        }
      } catch (summaryError) {
        console.error('Error generating summary:', summaryError);
        setError(prev => prev + '\nSummary generation failed: ' + summaryError.message);
      }

      // Use the same quiz generation logic from handleGenerateQuiz for consistency
      try {
        await handleGenerateQuiz();
      } catch (quizError) {
        console.error('Error generating quizzes:', quizError);
        setError(prev => prev + '\nQuiz generation failed: ' + quizError.message);
      }

      // Process only the selected learning style content
      console.log(`Processing content for learning style: ${learningStyle}`);
      
      if (learningStyle === 'reading_writing') {
        try {
          // Call the handleGenerateReadingWriting function directly
          await handleGenerateReadingWriting();
      } catch (readingError) {
        console.error('Error generating reading/writing content:', readingError);
        setError(prev => prev + '\nReading/writing content generation failed: ' + readingError.message);
      }
      } 
      else if (learningStyle === 'auditory') {
        try {
          // Call the handleGenerateAuditory function directly
          await handleGenerateAuditory();
      } catch (auditoryError) {
        console.error('Error generating auditory content:', auditoryError);
        setError(prev => prev + '\nAuditory content generation failed: ' + auditoryError.message);
      }
      }
      else if (learningStyle === 'kinesthetic') {
        try {
          // Call the handleGenerateKinesthetic function directly
          await handleGenerateKinesthetic();
      } catch (kinestheticError) {
        console.error('Error generating kinesthetic content:', kinestheticError);
        setError(prev => prev + '\nKinesthetic content generation failed: ' + kinestheticError.message);
      }
      }
      else if (learningStyle === 'visual') {
        try {
          // Call the handleGenerateVisual function directly
          await handleGenerateVisual();
      } catch (visualError) {
        console.error('Error generating visual content:', visualError);
        setError(prev => prev + '\nVisual content generation failed: ' + visualError.message);
        }
      }
      else {
        setError('No learning style selected. Please select a learning style for this document.');
      }

      setStatus('completed');
    } catch (error) {
      console.error('Error processing document:', error);
      setError('Failed to process document: ' + error.message);
      setStatus('error');
    } finally {
      setSummaryLoading(false);
      setQuizLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setSummaryLoading(true);
      setError('');
      const result = await generateSummary(id);
      if (result.success) {
        setSummary(result.summary);
      } else {
        throw new Error(result.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError(error.message || 'An error occurred while generating the summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setQuizLoading(true);
      setError('');
      setSelectedAnswers({});
      setShowAnswers(false);
      setQuizSubmitted(false);
      
      console.log('Generating both quiz types simultaneously');
      
      // Generate multiple choice quiz
      console.log('Generating multiple_choice quiz');
      const mcResult = await generateQuiz(id, 'multiple_choice');
      
      // Generate fill in blanks quiz with specific parameters for shorter questions and single blanks
      console.log('Generating fill_in_blanks quiz with single blank, shorter questions');
      const fbResult = await generateQuiz(id, 'fill_in_blanks', {
        max_question_length: 120,     // Increased from 40 to 120 for more complete sentences
        max_blanks: 1,               // Explicitly request only one blank per question
        single_blank_only: true,     // Additional flag to ensure only one blank
        simple_format: true,         // Request simpler formatted questions
        complete_sentences: true,    // Request complete, understandable sentences
        min_context: 40,             // Ensure there's enough context around the blank
        context_balanced: true       // Try to balance text before and after the blank
      });
      
      // Prepare updated quiz state with both types of quizzes
      const updatedQuiz = {};
      let hasQuestions = false;
      
      // Handle multiple choice result
      if (mcResult.success && mcResult.quiz) {
        const mcQuestions = Array.isArray(mcResult.quiz) 
          ? mcResult.quiz 
          : Array.isArray(mcResult.quiz.questions) 
            ? mcResult.quiz.questions 
            : [];
            
        console.log(`Got ${mcQuestions.length} multiple choice questions`);
        
        if (mcQuestions.length > 0) {
          updatedQuiz.multiple_choice = { questions: mcQuestions };
          hasQuestions = true;
        } else {
          console.warn('No multiple choice questions returned');
        }
      } else {
        console.error('Multiple choice quiz generation failed:', mcResult.error);
      }
      
      // Handle fill in blanks result
      if (fbResult.success && fbResult.quiz) {
        const fbQuestions = Array.isArray(fbResult.quiz) 
          ? fbResult.quiz 
          : Array.isArray(fbResult.quiz.questions) 
            ? fbResult.quiz.questions 
            : [];
            
        console.log(`Got ${fbQuestions.length} fill-in-the-blanks questions`);
        
        if (fbQuestions.length > 0) {
          // Process fill-in-blanks questions to ensure they're not too long and have only one blank
          const processedFbQuestions = fbQuestions.map(q => {
            // If we have separate text_before_blank and text_after_blank fields
            if ((q.text_before_blank || q.sentence_start) && (q.text_after_blank || q.sentence_end)) {
              const beforeText = q.text_before_blank || q.sentence_start || '';
              const afterText = q.text_after_blank || q.sentence_end || '';
              
              // Keep most of the text, only truncate very long texts
              const truncatedBefore = beforeText.length > 200 
                ? '...' + beforeText.substring(beforeText.length - 200) 
                : beforeText;
                
              // Keep most of the text, only truncate very long texts
              const truncatedAfter = afterText.length > 200 
                ? afterText.substring(0, 200) + '...' 
                : afterText;
                
              // Ensure the text flows naturally before and after the blank
              const formattedBeforeText = truncatedBefore.trim();
              const formattedAfterText = truncatedAfter.trim();
              
              // Make sure we have a space before and after the blank if needed
              const spaceBeforeBlank = formattedBeforeText && !formattedBeforeText.endsWith(' ') ? ' ' : '';
              const spaceAfterBlank = formattedAfterText && !formattedAfterText.startsWith(' ') ? ' ' : '';
              
              // Make sure we only have text format with one blank
              // Remove any secondary blanks in the text by filling them with placeholder text
              const singleBlankQuestion = {
                ...q,
                text_before_blank: formattedBeforeText + spaceBeforeBlank,
                text_after_blank: spaceAfterBlank + formattedAfterText,
                // Keep these fields for compatibility
                sentence_start: formattedBeforeText + spaceBeforeBlank,
                sentence_end: spaceAfterBlank + formattedAfterText
              };
              
              // If we somehow still have multiple blanks in the question text, fix it
              if (beforeText.includes('_____') || afterText.includes('_____')) {
                console.warn('Found multiple blank markers in question, fixing:', q);
                // Replace blanks in before_text with the word or a placeholder
                if (singleBlankQuestion.text_before_blank.includes('_____')) {
                  singleBlankQuestion.text_before_blank = 
                    singleBlankQuestion.text_before_blank.replace(/_{5}/g, '[term]');
                }
                
                // Replace blanks in after_text with the word or a placeholder
                if (singleBlankQuestion.text_after_blank.includes('_____')) {
                  singleBlankQuestion.text_after_blank = 
                    singleBlankQuestion.text_after_blank.replace(/_{5}/g, '[term]');
                }
              }
              
              return singleBlankQuestion;
            }
            return q;
          });
          
          updatedQuiz.fill_in_blanks = { questions: processedFbQuestions };
          hasQuestions = true;
        } else {
          console.warn('No fill-in-the-blanks questions returned');
        }
      } else {
        console.error('Fill-in-the-blanks quiz generation failed:', fbResult.error);
      }
      
      // Update quiz state with both types of questions
      if (hasQuestions) {
        setQuiz(updatedQuiz);
        console.log('Updated quiz with both types:', updatedQuiz);
      } else {
        // If both quiz types failed, combine their error messages
        const errorMessages = [];
        if (mcResult.error) errorMessages.push(`Multiple choice: ${mcResult.error}`);
        if (fbResult.error) errorMessages.push(`Fill-in-the-blanks: ${fbResult.error}`);
        
        const errorMessage = errorMessages.length > 0 
          ? `Failed to generate quizzes. ${errorMessages.join(' ')}` 
          : 'Failed to generate quizzes. No questions were returned.';
        
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error('Error generating quizzes:', error);
      toast.error('Quiz generation failed. Please try again.');
      setError(error.message || 'An error occurred while generating the quizzes');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizTypeChange = (event) => {
    setQuizType(event.target.value);
    setSelectedAnswers({});
    setShowAnswers(false);
    setQuizSubmitted(false);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    // For multiple choice, some answers may come as options[index] but we need to normalize them
    if (quizType === 'multiple_choice') {
      // If answer is single-character and numerical, treat it as index
      if (answer && answer.length === 1 && !isNaN(parseInt(answer))) {
        const index = parseInt(answer);
        const question = quiz[quizType].questions[questionIndex];
        if (question && question.options && question.options[index]) {
          // Use the option text as answer
          setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
          }));
          return;
        }
      }
    }
    
    // For fill in blanks or other cases
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    if (!quiz || !quiz[quizType]?.questions) return 0;
    
    let correct = 0;
    quiz[quizType].questions.forEach((question, index) => {
      const userAnswer = selectedAnswers[index];
      if (!userAnswer) return;
      
      // For multiple choice questions
      if (quizType === 'multiple_choice') {
        // The correct_answer might be a direct letter (A, B, C, D) or an index (0, 1, 2, 3)
        const isCorrect = 
          userAnswer === question.correct_answer || 
          userAnswer === question.correct_answer.toString() ||
          // Handle letter answers (convert A->0, B->1, etc.)
          (question.correct_answer.length === 1 && 
           !isNaN(parseInt(userAnswer)) && 
           String.fromCharCode(65 + parseInt(userAnswer)) === question.correct_answer);
        
        if (isCorrect) correct++;
      } 
      // For fill in blanks questions
      else {
        const correctAnswer = question.correct_answer || '';
        
        // Simple string match (case insensitive)
        if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          correct++;
        }
        // Check alternative answers if available
        else if (question.alternative_answers && Array.isArray(question.alternative_answers)) {
          const alternatives = question.alternative_answers.map(alt => alt.toLowerCase().trim());
          if (alternatives.includes(userAnswer.toLowerCase().trim())) {
            correct++;
          }
        }
      }
    });
    
    return Math.round((correct / quiz[quizType].questions.length) * 100);
  };

  // Get the appropriate icon and label for the learning style tab
  const getLearningStyleTabInfo = () => {
    switch (documentInfo?.learningStyle) {
      case 'visual':
        return { icon: <VisualIcon />, label: 'Visual Learning' };
      case 'auditory':
        return { icon: <AudioIcon />, label: 'Auditory Learning' };
      case 'reading_writing':
        return { icon: <ReadingIcon />, label: 'Reading/Writing Learning' };
      case 'kinesthetic':
        return { icon: <KinestheticIcon />, label: 'Kinesthetic Learning' };
      default:
        return { icon: <HelpOutlineIcon />, label: 'Select Learning Style' };
    }
  };

  // Automatically switch to the tab that matches the document's learning style
  useEffect(() => {
    // Restructured to avoid conditional hook execution
    const handleLearningStyleChange = () => {
      if (documentInfo?.learningStyle && (status === 'processing' || status === 'completed')) {
        // Don't automatically switch tabs - leave it at the current tab
        // Let the user decide which tab to view
      }
    };
    
    handleLearningStyleChange();
  }, [status, documentInfo?.learningStyle]);

  const learningStyleInfo = getLearningStyleTabInfo();

  const handleGenerateReadingWriting = async () => {
    try {
      setReadingWritingLoading(true);
      setReadingWritingError(null);
      const result = await processReadingWriting(id);
      console.log('Reading/writing content received:', result); // Add debugging log
      
      if (result.success) {
        // Ensure the content has the proper structure
        let processedContent = result.content || {};
        
        // Log what we're getting from the API
        console.log('Raw reading content:', processedContent);
        
        // Handle multiple content formats
        if (typeof processedContent === 'string') {
          // If it's just a string, wrap it in a structured format
          processedContent = {
            title: "Reading/Writing Learning Materials",
            sections: [
              {
                title: "Study Notes",
                content: processedContent
              }
            ]
          };
        } else if (typeof processedContent === 'object') {
          // If it's an object, ensure we have the right properties
          
          // Check if there are 'elements' in the response
          if (!processedContent.elements && processedContent.content && typeof processedContent.content === 'string') {
            // If no elements but has content string, create an element structure
            processedContent.elements = [
              {
                caption: "Study Notes",
                content: processedContent.content,
                type: "text"
              }
            ];
          }
          
          // Check if we need to add a sections array
          if (!processedContent.sections) {
            const contentText = processedContent.content || processedContent.text || "";
            
            if (typeof contentText === 'string' && contentText.trim() !== '') {
              processedContent.sections = [
                {
                  title: "Study Notes",
                  content: contentText
                }
              ];
            }
          }
        }
        
        // Set the reading content with docx and pdf URLs
        setReadingWritingContent({
          ...processedContent,
          docxUrl: result.docxUrl,
          pdfUrl: result.pdfUrl
        });
        
        // Log the final processed content
        console.log('Processed reading content:', processedContent);
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating reading/writing content:', error);
      setReadingWritingError('Failed to generate reading/writing content. Please try again.');
    } finally {
      setReadingWritingLoading(false);
    }
  };

  const handleGenerateAuditory = async () => {
    try {
      setAuditoryLoading(true);
      setAuditoryError(null);
      const result = await processAuditory(id);
      if (result.success) {
        setAuditoryContent(result.content);
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating auditory content:', error);
      setAuditoryError('Failed to generate auditory content. Please try again.');
    } finally {
      setAuditoryLoading(false);
    }
  };

  const handleGenerateKinesthetic = async () => {
    try {
      setKinestheticLoading(true);
      setKinestheticError(null);
      const result = await processKinesthetic(id);
      if (result.success) {
        setKinestheticContent(result.content);
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating kinesthetic content:', error);
      setKinestheticError('Failed to generate kinesthetic content. Please try again.');
    } finally {
      setKinestheticLoading(false);
    }
  };

  const handleGenerateVisual = async () => {
    try {
      setVisualLoading(true);
      setVisualError(null);
      
      const result = await processVisual(id);
      
      if (result.success) {
        setVisualContent(result.content);
        
        // Automatically fetch visual concepts after processing
        try {
          // Call the getVisualConcepts function
          const conceptsResult = await getVisualConcepts(id);
          
          if (conceptsResult.success) {
            // Merge the concepts with existing visual content
            const updatedVisualData = {
              title: "Visual Learning Materials",
              description: "Learn through diagrams, concept maps, and visual representations.",
              explanations: sanitizeVisualExplanations(conceptsResult.concepts),
              suggestions: result.content?.suggestions || []
            };
            
            setVisualContent(updatedVisualData);
          }
        } catch (conceptsError) {
          console.error('Error fetching visual concepts:', conceptsError);
          // We don't set an error here because we still have the visual content
        }
      } else {
        throw new Error(result.error || 'Failed to generate visual content');
      }
    } catch (error) {
      console.error('Error generating visual content:', error);
      setVisualError('Failed to generate visual content. Please try again.');
      toast.error('Error generating visual content');
    } finally {
      setVisualLoading(false);
    }
  };

  const handleGetVisualConcepts = async () => {
    try {
      setVisualLoading(true);
      setVisualError(null);
      
      // Fetch visual concepts from new API endpoint
      const result = await getVisualConcepts(id);
      console.log("Visual concepts result:", result);
      
      if (result.success) {
        // Create a compatible format for our viewer component
        const visualData = {
          title: "Visual Learning Materials",
          description: "Learn through diagrams, concept maps, and visual representations.",
          explanations: sanitizeVisualExplanations(result.concepts),
          suggestions: visualContent?.suggestions || []
        };
        
        setVisualContent(visualData);
      } else {
        throw new Error(result.error || 'Failed to fetch visual concepts');
      }
    } catch (error) {
      console.error('Error fetching visual concepts:', error);
      setVisualError('Failed to fetch visual concepts. Please try again.');
      toast.error('Error fetching visual concepts');
    } finally {
      setVisualLoading(false);
    }
  };

  // Add detailed logging for quiz data structure
  const currentQuizQuestions = quiz && quiz[quizType]?.questions;
  
  // Debug logging to console
  useEffect(() => {
    // Restructured to avoid conditional hook execution
    const logQuizData = () => {
      if (quiz) {
        console.log('Current quiz state:', quiz);
        console.log('Current quiz type:', quizType);
        console.log('Questions available:', currentQuizQuestions);
        
        if (!currentQuizQuestions || currentQuizQuestions.length === 0) {
          console.warn(`No questions found for quiz type: ${quizType}`);
          // Check if the other quiz type has questions
          const otherType = quizType === 'multiple_choice' ? 'fill_in_blanks' : 'multiple_choice';
          const otherQuestions = quiz[otherType]?.questions;
          if (otherQuestions && otherQuestions.length > 0) {
            console.log(`Found questions for ${otherType} instead`);
          }
        }
      }
    };
    
    logQuizData();
  }, [quiz, quizType, currentQuizQuestions]);
  
  // If we're switching to fill_in_blanks and there are no questions, try to generate them
  useEffect(() => {
    // Restructured to avoid conditional hook execution
    const generateMissingQuizQuestions = () => {
      if (quizType === 'fill_in_blanks' && quiz && !quiz.fill_in_blanks && !quizLoading) {
        console.log('Auto-generating fill_in_blanks questions since they are missing');
        handleGenerateQuiz();
      }
    };
    
    generateMissingQuizQuestions();
  }, [quizType, quiz, quizLoading]);
  
  // Update the quiz display condition to be more robust
  const hasQuizToShow = () => {
    // Check if we have any questions to show
    if (currentQuizQuestions && currentQuizQuestions.length > 0) {
      return true;
    }
    return false;
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    setShowAnswers(true);
    
    // Calculate score
    const score = calculateScore();
    
    // Create quiz data object with all necessary information
    const quizData = {
      quizId: `quiz_${quizType}_${documentInfo?.id}_${new Date().getTime()}`,
      quizName: `${documentInfo?.name || 'Document'} - ${quizType} Quiz`,
      score: Math.round((score / 100) * currentQuizQuestions.length),
      correctAnswers: Math.round((score / 100) * currentQuizQuestions.length),
      totalQuestions: currentQuizQuestions.length,
      percentage: score,
      documentId: documentInfo?.id,
      timestamp: new Date().toISOString()
    };
    
    // Track quiz effectiveness for learning style if available
    if (documentInfo?.learningStyle) {
      trackLearningStyleEffectiveness(
        quizData.quizId,
        documentInfo.id,
        documentInfo.learningStyle,
        score
      ).catch(error => {
        console.error('Error tracking learning style effectiveness:', error);
      });
    }

    console.log("ProcessingPage - Submitting quiz with data:", quizData);
    
    // Direct save to localStorage as a backup method
    try {
      const existingQuizzes = JSON.parse(localStorage.getItem('completedQuizzes')) || [];
      existingQuizzes.push(quizData);
      localStorage.setItem('completedQuizzes', JSON.stringify(existingQuizzes));
      console.log("ProcessingPage - Quiz saved directly to localStorage, count:", existingQuizzes.length);
    } catch (err) {
      console.error("ProcessingPage - Error saving directly to localStorage:", err);
    }
    
    // Dispatch quizSubmitted custom event for Dashboard to detect
    const quizSubmittedEvent = new CustomEvent('quizSubmitted', {
      detail: quizData,
      bubbles: true,
      cancelable: true
    });
    
    const dispatched = window.dispatchEvent(quizSubmittedEvent);
    console.log('ProcessingPage - Quiz submitted event dispatched:', dispatched);
    
    if (!dispatched) {
      console.error('ProcessingPage - Failed to dispatch quiz event');
      
      // Show toast notification for user feedback
      toast.success('Quiz completed! Check the dashboard to see your progress.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {!currentUser ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Authentication Required</Typography>
          <Typography variant="body1" paragraph>
            Please log in to process documents.
          </Typography>
          <Button variant="contained" onClick={() => history.push('/login')}>
            Go to Login
          </Button>
        </Paper>
      ) : (
        <Box sx={{ mb: 5 }}>
          <Paper 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}  
          >
            {/* Document Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 4,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={handleBack} 
                  size="small"
                  sx={{ 
                    width: 32,
                    height: 32,
                    '& .MuiSvgIcon-root': {
                      fontSize: 18
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" component="h1">
                  {documentInfo?.name || 'Loading...'}
                </Typography>
                <Chip
                  icon={<DescriptionIcon />}
                  label={documentInfo?.learningStyle || 'Select Learning Style'}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Process button */}
              <Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleProcessWithAI}
                  disabled={status === 'processing' || !documentInfo?.learningStyle}
                  startIcon={status === 'processing' ? <CircularProgress size={16} /> : <PsychologyIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    height: 32,
                    fontSize: '0.875rem',
                    px: 2,
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    }
                  }}
                >
                  {status === 'processing' ? 'Processing...' : `Process ${learningStyleInfo.label}`}
                </Button>
                {!documentInfo?.learningStyle && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Please select a learning style for this document first
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="document processing tabs"
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: '64px',
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    flex: '1 1 0px',
                    width: '33.33%',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.5rem',
                      mr: 1
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: '3px'
                  }
                }}
              >
                <Tab 
                  icon={<DescriptionIcon />} 
                  iconPosition="start"
                  label="Summary" 
                  sx={{ maxWidth: 'none' }}
                />
                <Tab 
                  icon={<QuizIcon />}
                  iconPosition="start" 
                  label="Quiz" 
                  sx={{ maxWidth: 'none' }}
                />
                <Tab 
                  icon={learningStyleInfo.icon}
                  iconPosition="start" 
                  label={learningStyleInfo.label}
                  sx={{ maxWidth: 'none' }}
                />
              </Tabs>
            </Box>

            {/* Summary Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 4 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      whiteSpace: 'pre-line',
                      '& .MuiAlert-message': {
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    {error}
                  </Alert>
                )}
                
                {!summary && !summaryLoading && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 4
                  }}>
                    <DescriptionIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                    <Typography color="text.secondary" sx={{ fontSize: '1.25rem', mb: 4 }}>
                      Generate a summary of your file to see key points<br />
                      and main ideas.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<DescriptionIcon />}
                      onClick={handleGenerateSummary}
                      sx={{ 
                        mt: 3,
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4
                      }}
                    >
                      Generate Summary
                    </Button>
                  </Box>
                )}

                {summaryLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                )}

                {summary && (
                  <Box sx={{ 
                    maxWidth: '800px', 
                    mx: 'auto',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
                    borderRadius: 2,
                    p: 4,
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                  }}>
                    <Typography 
                      variant="h4" 
                      gutterBottom
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mb: 4,
                        textAlign: 'center'
                      }}
                    >
                      Document Summary
                    </Typography>

                    <Box sx={{ 
                      whiteSpace: 'pre-wrap',
                      '& > p': { mb: 3 },
                      '& ul': { pl: 3, mb: 3 },
                      '& h2': { 
                        color: theme.palette.primary.main,
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        mt: 4,
                        mb: 2
                      },
                      '& h3': {
                        color: theme.palette.primary.light,
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        mt: 3,
                        mb: 2
                      }
                    }}>
                      <div dangerouslySetInnerHTML={{ 
                        __html: summary.split('\n').map(line => {
                          // Convert markdown headers
                          if (line.startsWith('# ')) return `<h2>${line.substring(2)}</h2>`;
                          if (line.startsWith('## ')) return `<h3>${line.substring(3)}</h3>`;
                          if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
                          
                          // Convert bullet points
                          if (line.startsWith('* ') || line.startsWith('- ')) {
                            if (!line.match(/<ul>/)) return `<ul><li>${line.substring(2)}</li></ul>`;
                            return `<li>${line.substring(2)}</li>`;
                          }
                          
                          // Regular paragraphs
                          return line ? `<p>${line}</p>` : '';
                        }).join('\n') 
                      }} />
                    </Box>

                    <Box sx={{ 
                      display: 'flex',
                      gap: 2,
                      mt: 6,
                      justifyContent: 'center'
                    }}>
                      <Button
                        variant="contained"
                        onClick={handleGenerateSummary}
                        startIcon={<DescriptionIcon />}
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          '&:hover': { bgcolor: theme.palette.primary.dark }
                        }}
                      >
                        Regenerate Summary
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Quiz Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 4 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      '& .MuiAlert-message': {
                        fontSize: '1rem'
                      }
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}

                <Box sx={{ 
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexWrap: 'wrap'
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ color: theme.palette.primary.main }}
                    >
                      Quiz Type
                    </Typography>
                    <RadioGroup
                      row
                      value={quizType}
                      onChange={handleQuizTypeChange}
                    >
                      <FormControlLabel 
                        value="multiple_choice" 
                        control={
                          <Radio 
                            sx={{
                              '&.Mui-checked': {
                                color: theme.palette.primary.main
                              }
                            }}
                          />
                        } 
                        label="Multiple Choice" 
                      />
                      <FormControlLabel 
                        value="fill_in_blanks" 
                        control={
                          <Radio 
                            sx={{
                              '&.Mui-checked': {
                                color: theme.palette.primary.main
                              }
                            }}
                          />
                        } 
                        label="Fill in the Blanks" 
                      />
                    </RadioGroup>
                  </Box>
                </Box>

                {!quiz && !quizLoading && status !== 'processing' ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 4
                  }}>
                    <QuizIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                    <Typography color="text.secondary" sx={{ fontSize: '1.25rem', mb: 4 }}>
                      Generate quiz questions based on your document<br />
                      to test your knowledge and reinforce learning.
                    </Typography>
                    
                    <Box sx={{ maxWidth: '600px', mb: 5 }}>
                      <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                          What to expect:
                        </Typography>
                        <ul style={{ marginLeft: '20px', paddingLeft: 0 }}>
                          <li>Multiple choice questions with detailed explanations</li>
                          <li>Fill-in-the-blank questions to test recall</li>
                          <li>Instant scoring and feedback on your answers</li>
                        </ul>
                      </Alert>
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGenerateQuiz}
                      startIcon={<QuizIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
                        fontSize: '1.1rem'
                      }}
                    >
                      Generate Quiz
                    </Button>
                  </Box>
                ) : quizLoading || status === 'processing' ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : hasQuizToShow() ? (
                  <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mb: 4,
                        textAlign: 'center'
                      }}
                    >
                      {quizType === 'multiple_choice' ? 'Multiple Choice Quiz (10 Questions)' : 'Fill in the Blanks Quiz (5 Questions)'}
                    </Typography>

                    {quizSubmitted && (
                      <Alert 
                        severity={calculateScore() >= 70 ? "success" : "info"} 
                        sx={{ mb: 4 }}
                      >
                        Your Score: {calculateScore()}%
                      </Alert>
                    )}

                    {currentQuizQuestions.map((question, index) => (
                      <Accordion 
                        key={index}
                        expanded={showAnswers}
                        sx={{ 
                          mb: 2,
                          '&:before': {
                            display: 'none',
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(63, 81, 181, 0.1)' 
                              : 'rgba(63, 81, 181, 0.03)',
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark' 
                                ? 'rgba(63, 81, 181, 0.2)' 
                                : 'rgba(63, 81, 181, 0.06)',
                            }
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600
                              }}
                            >
                              Question {index + 1}
                            </Typography>
                            
                            {quizType === 'multiple_choice' ? (
                              <>
                                <Typography sx={{ mb: 2 }}>{question.question}</Typography>
                                <RadioGroup
                                  value={selectedAnswers[index] || ''}
                                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                                  sx={{ mt: 2 }}
                                >
                                  {question.options && question.options.map((option, optIndex) => (
                                    <FormControlLabel
                                      key={optIndex}
                                      value={option.charAt(0)}
                                      control={<Radio />}
                                      label={option}
                                      disabled={showAnswers}
                                      sx={{
                                        mb: 1,
                                        '& .MuiFormControlLabel-label': {
                                          fontSize: '1rem'
                                        }
                                      }}
                                    />
                                  ))}
                                </RadioGroup>
                              </>
                            ) : (
                              <Box sx={{ mt: 2 }}>
                                {/* Handle different possible field names for fill-in-blanks questions */}
                                {question.question && (
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                                    {question.question}
                                  </Typography>
                                )}
                                
                                {!question.question && (
                                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                                    Fill in the blank with the appropriate word or phrase:
                                  </Typography>
                                )}
                                
                                <Box sx={{ 
                                  display: 'block', 
                                  mb: 3, 
                                  p: 3, 
                                  borderRadius: 1,
                                  bgcolor: 'rgba(63, 81, 181, 0.03)',
                                  border: '1px solid rgba(63, 81, 181, 0.08)',
                                  wordBreak: 'normal',
                                  overflowWrap: 'anywhere'
                                }}>
                                  <Typography 
                                    component="div" 
                                    sx={{ 
                                      lineHeight: 2,
                                      fontSize: '1rem',
                                      fontWeight: 400,
                                      wordBreak: 'normal',
                                      overflowWrap: 'anywhere',
                                      whiteSpace: 'normal',
                                      '& span.blank': {
                                        mx: 1,
                                        px: 2,
                                        py: 0.5,
                                        bgcolor: 'rgba(63, 81, 181, 0.08)',
                                        border: '1px dashed #3f51b5',
                                        borderRadius: 1,
                                        display: 'inline-block',
                                        minWidth: '80px',
                                        maxWidth: 'fit-content',
                                        textAlign: 'center',
                                        position: 'relative',
                                        fontWeight: 500
                                      }
                                    }}
                                  >
                                    {/* Text before blank - handle different field names */}
                                    {question.text_before_blank || question.sentence_start || question.before_blank || ''}
                                    
                                    {/* Single blank space to fill in */}
                                    <span className="blank">
                                      {showAnswers ? (question.correct_answer || '') : '_____'}
                                    </span>
                                    
                                    {/* Text after blank - handle different field names */}
                                    {question.text_after_blank || question.sentence_end || question.after_blank || ''}
                                  </Typography>
                                </Box>
                                
                                <TextField
                                  fullWidth
                                  variant="outlined"
                                  placeholder="Type your answer here"
                                  value={selectedAnswers[index] || ''}
                                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                                  disabled={showAnswers}
                                  sx={{ 
                                    mt: 1,
                                    '& .MuiOutlinedInput-root': {
                                      '&:hover fieldset': {
                                        borderColor: '#3f51b5',
                                      },
                                    },
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white' }}>
                          <Box sx={{ mt: 2 }}>
                            <Typography 
                              color="primary" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '1.1rem'
                              }}
                            >
                              Correct Answer: {question.correct_answer}
                              {question.alternative_answers && question.alternative_answers.length > 0 && (
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    color: 'text.secondary',
                                    fontWeight: 'normal',
                                    fontSize: '0.9rem',
                                    ml: 2
                                  }}
                                >
                                  (Also accepted: {question.alternative_answers.join(', ')})
                                </Typography>
                              )}
                            </Typography>
                            <Typography 
                              color="text.secondary"
                              sx={{ 
                                lineHeight: 1.6,
                                fontSize: '1rem'
                              }}
                            >
                              {question.explanation}
                            </Typography>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}

                    <Box sx={{ 
                      mt: 4, 
                      display: 'flex', 
                      gap: 2,
                      justifyContent: 'center'
                    }}>
                      {!showAnswers && (
                        <Button
                          variant="contained"
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(selectedAnswers).length < currentQuizQuestions.length}
                          sx={{ 
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                            px: 4,
                            py: 1.5
                          }}
                        >
                          Submit Answers
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        onClick={handleGenerateQuiz}
                        startIcon={<QuizIcon />}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        Generate New Quiz
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </TabPanel>

            {/* Learning Style Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                px: 4
              }}>
                {!documentInfo?.learningStyle && (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    Please select a learning style for this document first.
                  </Typography>
                )}
                
                {documentInfo?.learningStyle === 'reading_writing' ? (
                  <>
                    {readingWritingError && (
                      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {readingWritingError}
                      </Alert>
                    )}

                    {readingWritingLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Generating reading materials...</Typography>
                      </Box>
                    ) : readingWritingContent ? (
                      <Box sx={{ width: '100%', maxWidth: 800 }}>
                        <Paper sx={{ p: 4, mb: 3 }}>
                          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                            Reading Materials
                          </Typography>
                          
                          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            Study notes and written explanations optimized for reading/writing learners.
                          </Typography>

                          {/* Handle elements array if it exists */}
                          {readingWritingContent.elements && readingWritingContent.elements.map((element, index) => (
                            <Box key={index} sx={{ 
                              mt: 4,
                              textAlign: 'left',
                              '& h1': { 
                                fontSize: '2rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 3,
                                mt: 4 
                              },
                              '& h2': { 
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 2,
                                mt: 3 
                              },
                              '& h3': { 
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: theme.palette.primary.light,
                                mb: 2,
                                mt: 3 
                              },
                              '& p': { 
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                mb: 2.5,
                                color: theme.palette.text.primary,
                                maxWidth: '100%',
                                textAlign: 'left'
                              },
                              '& blockquote': {
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                pl: 3,
                                py: 1,
                                my: 3,
                                mx: 0,
                                bgcolor: theme.palette.mode === 'dark' 
                                  ? 'rgba(63, 81, 181, 0.15)' 
                                  : 'rgba(63, 81, 181, 0.05)',
                                borderRadius: '4px',
                                '& p': {
                                  color: theme.palette.primary.main,
                                  fontStyle: 'italic',
                                  mb: 0
                                }
                              }
                            }}>
                              {element.type === 'text' && (
                                <>
                                  {element.caption && (
                                    <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                                      {element.caption}
                                    </Typography>
                                  )}
                                  <div 
                                    dangerouslySetInnerHTML={{ 
                                      __html: element.content
                                        .split('\n')
                                        .map(line => {
                                          if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                                          if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                                          if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                                          if (line.startsWith('> ')) return `<blockquote><p>${line.slice(2)}</p></blockquote>`;
                                          return line ? `<p>${line}</p>` : '';
                                        })
                                        .join('\n')
                                    }} 
                                  />
                                </>
                              )}
                            </Box>
                          ))}
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                          <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleGenerateReadingWriting}
                          >
                            Regenerate Content
                          </Button>
                          
                          {readingWritingContent.pdfUrl && (
                            <Button
                              variant="contained"
                              startIcon={<PdfIcon />}
                              href={readingWritingContent.pdfUrl}
                              target="_blank"
                              sx={{ 
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                              }}
                            >
                              View PDF
                            </Button>
                          )}
                          
                          {readingWritingContent.docxUrl && (
                            <Button
                              variant="contained"
                              startIcon={<CloudUploadIcon />}
                              href={readingWritingContent.docxUrl}
                              download="study_notes.docx"
                              sx={{ 
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                              }}
                            >
                              Download DOCX
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center',
                        py: 4
                      }}>
                        <ReadingIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                          Reading/Writing Learning Materials
                        </Typography>
                        
                        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
                          Click the "Process with AI" button at the top to generate reading materials optimized for your learning style.
                        </Typography>
                        
                        <Box sx={{ width: '100%', mb: 4 }}>
                          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                              What to expect:
                            </Typography>
                            <ul style={{ marginLeft: '20px', paddingLeft: 0 }}>
                              <li>Detailed study notes and summaries of key concepts</li>
                              <li>Written explanations in an easy-to-understand format</li>
                              <li>Downloadable documents for later reference</li>
                              <li>Text-based examples and definitions of important terms</li>
                              <li>Content processed in chunks for better organization</li>
                              <li>Note: PDF/DOCX may have different formatting than website view</li>
                            </ul>
                          </Alert>
                        </Box>
                        
                        <Button
                          variant="contained"
                          startIcon={<ReadingIcon />}
                          onClick={handleGenerateReadingWriting}
                          sx={{ 
                            mt: 3,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 4
                          }}
                        >
                          Generate Reading Content
                        </Button>
                      </Box>
                    )}
                  </>
                ) : documentInfo?.learningStyle === 'auditory' ? (
                  <>
                    {auditoryError && (
                      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {auditoryError}
                      </Alert>
                    )}

                    {auditoryLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Generating auditory materials...</Typography>
                      </Box>
                    ) : auditoryContent ? (
                      <Box sx={{ width: '100%', maxWidth: 800 }}>
                        <Paper sx={{ p: 4, mb: 3 }}>
                          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                            {auditoryContent.title || 'Audio Learning Materials'}
                          </Typography>
                          
                          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            {auditoryContent.description || 'A spoken-friendly explanation optimized for auditory learners.'}
                          </Typography>

                          {/* Audio Player */}
                          {auditoryContent.audioUrl && (
                            <Box sx={{ 
                              mb: 4, 
                              p: 3, 
                              bgcolor: 'rgba(63, 81, 181, 0.03)', 
                              borderRadius: 2,
                              border: '1px solid rgba(63, 81, 181, 0.1)'
                            }}>
                              <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, mb: 2 }}>
                                <AudioIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Audio Explanation
                              </Typography>
                              <audio 
                                controls 
                                style={{ width: '100%' }}
                                src={auditoryContent.audioUrl}
                              >
                                Your browser does not support the audio element.
                              </audio>
                            </Box>
                          )}

                          {/* Text Content */}
                          {auditoryContent.elements && auditoryContent.elements.map((element, index) => (
                            <Box key={index} sx={{ 
                              mt: 4,
                              textAlign: 'left',
                              '& h1': { 
                                fontSize: '2rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 3,
                                mt: 4 
                              },
                              '& h2': { 
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 2,
                                mt: 3 
                              },
                              '& h3': { 
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: theme.palette.primary.light,
                                mb: 2,
                                mt: 3 
                              },
                              '& p': { 
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                mb: 2.5,
                                color: theme.palette.text.primary,
                                maxWidth: '100%',
                                textAlign: 'left'
                              },
                              '& blockquote': {
                                borderLeft: '4px solid #3f51b5',
                                pl: 3,
                                py: 1,
                                my: 3,
                                mx: 0,
                                bgcolor: 'rgba(63, 81, 181, 0.05)',
                                borderRadius: '4px',
                                '& p': {
                                  color: '#1a237e',
                                  fontStyle: 'italic',
                                  mb: 0
                                }
                              }
                            }}>
                              {element.type === 'text' && (
                                <>
                                  {element.caption && (
                                    <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                                      {element.caption}
                                    </Typography>
                                  )}
                                  <div 
                                    dangerouslySetInnerHTML={{ 
                                      __html: element.content
                                        .split('\n')
                                        .map(line => {
                                          if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
                                          if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
                                          if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
                                          if (line.startsWith('> ')) return `<blockquote><p>${line.slice(2)}</p></blockquote>`;
                                          return line ? `<p>${line}</p>` : '';
                                        })
                                        .join('\n')
                                    }} 
                                  />
                                </>
                              )}
                            </Box>
                          ))}
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                          <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleGenerateAuditory}
                          >
                            Regenerate Content
                          </Button>
                          {auditoryContent.audioUrl && (
                            <Button
                              variant="contained"
                              startIcon={<CloudUploadIcon />}
                              href={auditoryContent.audioUrl}
                              download="audio_explanation.mp3"
                              sx={{ 
                                bgcolor: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                              }}
                            >
                              Download Audio
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center',
                        py: 4
                      }}>
                        <AudioIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                          Audio Learning Materials
                        </Typography>
                        
                        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
                          Click the "Process with AI" button at the top to generate audio materials optimized for auditory learners.
                        </Typography>
                        
                        <Box sx={{ width: '100%', mb: 4 }}>
                          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                              What to expect:
                            </Typography>
                            <ul style={{ marginLeft: '20px', paddingLeft: 0 }}>
                              <li>Audio explanations of key concepts</li>
                              <li>Spoken-friendly content optimized for listening</li>
                              <li>Downloadable audio files for later listening</li>
                              <li>Text transcripts to follow along with audio</li>
                            </ul>
                          </Alert>
                        </Box>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AudioIcon />}
                          onClick={handleGenerateAuditory}
                          sx={{ 
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                            py: 1.5,
                            px: 3
                          }}
                        >
                          Generate Audio
                        </Button>
                      </Box>
                    )}
                  </>
                ) : documentInfo?.learningStyle === 'kinesthetic' ? (
                  <>
                    {kinestheticError && (
                      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {kinestheticError}
                      </Alert>
                    )}

                    {!kinestheticContent && !kinestheticLoading && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        py: 4,
                        maxWidth: '700px',
                        mx: 'auto'
                      }}>
                        <KinestheticIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                          Kinesthetic Learning Activities
                        </Typography>
                        
                        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
                          Generate hands-on activities and interactive exercises that let you learn by doing and engaging physically with the material.
                        </Typography>
                        
                        <Box sx={{ width: '100%', mb: 4 }}>
                          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                              What to expect:
                            </Typography>
                            <ul style={{ marginLeft: '20px', paddingLeft: 0 }}>
                              <li>Practical exercises to reinforce key concepts</li>
                              <li>Step-by-step instructions for hands-on activities</li>
                              <li>Interactive learning tasks to improve retention</li>
                              <li>Materials lists and tips for successful practice</li>
                            </ul>
                          </Alert>
                        </Box>
                        
                        <Button
                          variant="contained"
                          startIcon={<KinestheticIcon />}
                          onClick={handleGenerateKinesthetic}
                          sx={{ 
                            mt: 3,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 4
                          }}
                        >
                          Generate Activities
                        </Button>
                      </Box>
                    )}

                    {kinestheticLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Generating interactive activities...</Typography>
                      </Box>
                    ) : kinestheticContent ? (
                      <Box sx={{ width: '100%', maxWidth: 800 }}>
                        <Paper sx={{ p: 4, mb: 3 }}>
                          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                            Interactive Learning Activities
                          </Typography>

                          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            Learn by doing! Complete these hands-on activities to reinforce your understanding.
                          </Typography>

                          {kinestheticContent.activities && kinestheticContent.activities.map((activity, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                mb: 4,
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '1px solid rgba(63, 81, 181, 0.1)'
                              }}
                            >
                              {/* Activity Header */}
                              <Box sx={{ 
                                p: 3, 
                                bgcolor: 'rgba(63, 81, 181, 0.03)',
                                borderBottom: '1px solid rgba(63, 81, 181, 0.1)'
                              }}>
                                <Typography variant="h6" sx={{ 
                                  color: theme.palette.primary.main, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  mb: 1
                                }}>
                                  <KinestheticIcon sx={{ fontSize: 24 }} />
                                  {activity.title}
                                </Typography>

                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                  {activity.description}
                                </Typography>
                              </Box>

                              {/* Activity Content */}
                              <Box sx={{ p: 3 }}>
                                {/* Materials Section */}
                                {activity.materials && activity.materials.length > 0 && (
                                  <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ 
                                      color: theme.palette.primary.main,
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      <Box component="span" sx={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(63, 81, 181, 0.1)',
                                        color: theme.palette.primary.main
                                      }}>
                                        <span style={{ fontSize: '14px' }}>📦</span>
                                      </Box>
                                      Materials Needed:
                                    </Typography>
                                    <Box sx={{ 
                                      pl: 4,
                                      borderLeft: '2px solid rgba(63, 81, 181, 0.1)'
                                    }}>
                                      <ul style={{ 
                                        margin: '8px 0',
                                        paddingLeft: '20px',
                                        listStyle: 'none'
                                      }}>
                                        {activity.materials.map((material, idx) => (
                                          <li key={idx} style={{ 
                                            marginBottom: '8px',
                                            position: 'relative'
                                          }}>
                                            <Typography variant="body2" sx={{ 
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1
                                            }}>
                                              <Box component="span" sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: theme.palette.primary.main,
                                                flexShrink: 0
                                              }} />
                                              {material}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  </Box>
                                )}

                                {/* Steps Section */}
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="subtitle1" gutterBottom sx={{ 
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}>
                                    <Box component="span" sx={{ 
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: 'rgba(63, 81, 181, 0.1)',
                                      color: theme.palette.primary.main
                                    }}>
                                      <span style={{ fontSize: '14px' }}>📝</span>
                                    </Box>
                                    Steps:
                                  </Typography>
                                  <Box sx={{ 
                                    pl: 4,
                                    borderLeft: '2px solid rgba(63, 81, 181, 0.1)'
                                  }}>
                                    <ol style={{ 
                                      margin: '8px 0',
                                      paddingLeft: '20px'
                                    }}>
                                      {activity.steps.map((step, stepIndex) => (
                                        <li key={stepIndex}>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              mb: 2,
                                              lineHeight: 1.6
                                            }}
                                          >
                                            {step}
                                          </Typography>
                                        </li>
                                      ))}
                                    </ol>
                                  </Box>
                                </Box>

                                {/* Tips Section */}
                                {activity.tips && activity.tips.length > 0 && (
                                  <Box sx={{ 
                                    mb: 3,
                                    p: 2,
                                    bgcolor: 'rgba(63, 81, 181, 0.03)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(63, 81, 181, 0.08)'
                                  }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ 
                                      color: theme.palette.primary.main,
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      <Box component="span" sx={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(63, 81, 181, 0.1)',
                                        color: theme.palette.primary.main
                                      }}>
                                        <span style={{ fontSize: '14px' }}>💡</span>
                                      </Box>
                                      Tips for Success:
                                    </Typography>
                                    <Box sx={{ pl: 4 }}>
                                      <ul style={{ 
                                        margin: '8px 0',
                                        paddingLeft: '20px',
                                        listStyle: 'none'
                                      }}>
                                        {activity.tips.map((tip, tipIndex) => (
                                          <li key={tipIndex} style={{ 
                                            marginBottom: '8px',
                                            position: 'relative'
                                          }}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                color: 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                              }}
                                            >
                                              <Box component="span" sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: theme.palette.primary.main,
                                                flexShrink: 0
                                              }} />
                                              {tip}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  </Box>
                                )}

                                {/* Reflection Questions Section */}
                                {activity.reflection && activity.reflection.length > 0 && (
                                  <Box sx={{ 
                                    p: 2,
                                    bgcolor: 'rgba(63, 81, 181, 0.03)',
                                    borderRadius: 1,
                                    border: '1px solid rgba(63, 81, 181, 0.08)'
                                  }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ 
                                      color: theme.palette.primary.main,
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      <Box component="span" sx={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(63, 81, 181, 0.1)',
                                        color: theme.palette.primary.main
                                      }}>
                                        <span style={{ fontSize: '14px' }}>🤔</span>
                                      </Box>
                                      Reflection Questions:
                                    </Typography>
                                    <Box sx={{ pl: 4 }}>
                                      <ul style={{ 
                                        margin: '8px 0',
                                        paddingLeft: '20px',
                                        listStyle: 'none'
                                      }}>
                                        {activity.reflection.map((question, qIndex) => (
                                          <li key={qIndex} style={{ 
                                            marginBottom: '8px',
                                            position: 'relative'
                                          }}>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                color: 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                              }}
                                            >
                                              <Box component="span" sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                bgcolor: theme.palette.primary.main,
                                                flexShrink: 0
                                              }} />
                                              {question}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                          <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleGenerateKinesthetic}
                          >
                            Generate New Activities
                          </Button>
                        </Box>
                      </Box>
                    ) : null}
                  </>
                ) : documentInfo?.learningStyle === 'visual' ? (
                  <>
                    {visualError && (
                      <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                        {visualError}
                      </Alert>
                    )}

                    {visualLoading ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Generating visual materials...</Typography>
                      </Box>
                    ) : visualContent ? (
                      <Box sx={{ width: '100%', maxWidth: 800 }}>
                        <Paper sx={{ 
                          p: 4, 
                          mb: 3,
                          height: 'auto',
                          minHeight: '600px',
                          overflow: 'visible',
                          '& .MuiTabPanel-root': {
                            height: 'auto',
                            minHeight: '500px',
                            overflow: 'visible'
                          }
                        }}>
                          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 3 }}>
                            {visualContent.title || "Visual Learning Materials"}
                          </Typography>

                          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            {visualContent.description || "Learn through diagrams, concept maps, and visual representations."}
                          </Typography>

                          {/* Visual Concept Explanations */}
                          {visualContent && visualContent.explanations && visualContent.explanations.length > 0 && (
                            <VisualExplanationViewer 
                              data={visualContent.explanations} 
                              title="Visual Concept Explanations"
                            />
                          )}
                        </Paper>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                          <Button
                            variant="outlined"
                            startIcon={<VisualIcon />}
                            onClick={handleGenerateVisual}
                          >
                            Generate Visuals
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center',
                        py: 4
                      }}>
                        <VisualIcon sx={{ fontSize: 72, color: 'text.secondary', mb: 3 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.palette.primary.main }}>
                          Visual Learning Materials
                        </Typography>
                        
                        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 4 }}>
                          Click the "Process with AI" button at the top to generate visual materials optimized for your learning style.
                        </Typography>
                        
                        <Box sx={{ width: '100%', mb: 4 }}>
                          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                              What to expect:
                            </Typography>
                            <ul style={{ marginLeft: '20px', paddingLeft: 0 }}>
                              <li>Detailed study notes and summaries of key concepts</li>
                              <li>Written explanations in an easy-to-understand format</li>
                              <li>Downloadable documents for later reference</li>
                              <li>Text-based examples and definitions of important terms</li>
                              <li>Content processed in chunks for better organization</li>
                              <li>Note: PDF/DOCX may have different formatting than website view</li>
                            </ul>
                          </Alert>
                        </Box>
                        
                        <Button
                          variant="contained"
                          startIcon={<VisualIcon />}
                          onClick={handleGenerateVisual}
                          sx={{ 
                            mt: 3,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: theme.palette.primary.dark },
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 4
                          }}
                        >
                          Generate Visual Content
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Please select a learning style for this document first.
                    </Typography>
                  <Button
                    variant="contained"
                      onClick={handleBack}
                      sx={{ mt: 2 }}
                    >
                      Go Back to Documents
                  </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default ProcessingPage; 