// ===== TENSORFLOW MOOD CLASSIFIER =====
// File: tensorflow-mood-classifier.js

class TensorFlowMoodClassifier {
    constructor() {
        this.model = null;
        this.encoder = null;
        this.isReady = false;
        
        // Mood categories
        this.moods = ['anxious', 'sad', 'angry', 'tired', 'restless', 'positive'];
        
        // EXPANDED TRAINING DATA
        this.trainingData = {
            anxious: [
                "I'm so worried about everything",
                "I can't stop thinking about what might go wrong",
                "My heart is racing and I feel panicky",
                "I'm freaking out right now",
                "Everything feels overwhelming",
                "I'm having a panic attack",
                "Can't catch my breath",
                "Everything is spiraling",
                "I'm losing control",
                "My anxiety is through the roof",
                "Im stressed af about this",
                "I cant stop overthinking everything",
                "My mind wont stop racing",
                "Feel like im gonna have a breakdown",
                "So anxious i could throw up",
                "Everything makes me nervous rn",
                "Cant shake this worried feeling",
                "My chest feels tight and im scared",
                "Panicking about literally everything",
                "I feel like somethings gonna go wrong",
                "Too anxious to even leave the house",
                "My brain is stuck on worst case scenarios",
                "Cant stop worrying about what if",
                "Feel like im on the edge",
                "This anxiety is killing me",
                "I dont know how to calm down",
                "Everything triggers my anxiety",
                "Feel like im suffocating from stress",
                "My nerves are completely shot",
                "Cant handle this pressure anymore"
            ],
            
            sad: [
                "I feel so down today",
                "Nothing makes me happy anymore",
                "I just want to cry",
                "I'm in my feels and it's bad",
                "Life feels empty",
                "I feel really lonely",
                "Everything feels hopeless",
                "I'm so depressed",
                "Nothing matters anymore",
                "I feel numb inside",
                "Im so sad i cant even explain it",
                "Feel like crying for no reason",
                "Everything just sucks right now",
                "I dont see the point anymore",
                "So lonely even when people are around",
                "Nothing brings me joy lately",
                "Im stuck in this dark place",
                "Cant remember the last time i smiled",
                "Feel empty and hollow inside",
                "The sadness wont go away",
                "I miss feeling happy",
                "Everything feels grey and dull",
                "Lost interest in everything i used to love",
                "Cant stop the tears today",
                "Feel like nobody understands me",
                "This sadness is crushing me",
                "I feel so alone in this world",
                "Dont know how to feel better",
                "Life feels meaningless right now",
                "Im drowning in sadness"
            ],
            
            angry: [
                "I'm so frustrated right now",
                "Everything is making me mad",
                "I'm really pissed off",
                "This is so annoying",
                "I'm heated about this",
                "I could punch a wall",
                "Everyone is getting on my nerves",
                "I'm so done with everything",
                "This makes me furious",
                "I'm so angry I can't think straight",
                "Im so mad i could scream",
                "This is pissing me off so much",
                "Cant deal with this bs anymore",
                "Everyone is annoying me today",
                "Im about to lose it",
                "So frustrated i wanna break something",
                "This is driving me crazy",
                "Sick and tired of this crap",
                "Im heated and need to cool down",
                "Everything is making me rage",
                "Cant stand this anymore",
                "Im at my breaking point",
                "This anger is eating me alive",
                "Want to yell at everyone",
                "So irritated by everything",
                "This situation has me seeing red",
                "Im furious and cant calm down",
                "Fed up with all of this",
                "My patience is completely gone",
                "Im angry at the world right now"
            ],
            
            tired: [
                "I'm completely exhausted",
                "I have no energy left",
                "I'm running on fumes",
                "I'm so dead right now",
                "Can't keep my eyes open",
                "I'm burned out",
                "Too tired to function",
                "I feel drained",
                "I'm wiped out",
                "Zero energy today",
                "Im so tired i cant even",
                "Feel like a zombie today",
                "Exhausted beyond words",
                "Running on empty rn",
                "Too tired to do anything",
                "My body feels so heavy",
                "Cant muster any energy",
                "Im completely drained",
                "Feel like i could sleep for days",
                "Too exhausted to think",
                "My brain is fried",
                "Physically and mentally exhausted",
                "Cant function im so tired",
                "Feel like collapsing",
                "Energy levels at zero",
                "So worn out from everything",
                "Tired doesnt even describe it",
                "Im running on caffeine and spite",
                "Feel like ive been hit by a truck",
                "Too tired to even sleep properly"
            ],
            
            restless: [
                "I can't sleep at all",
                "My brain won't shut off",
                "I've been up all night",
                "Can't relax no matter what",
                "Too wired to sleep",
                "Can't sit still",
                "My mind is racing",
                "I feel so restless",
                "Can't get comfortable",
                "Tossing and turning all night",
                "Cant sleep brain wont shut up",
                "Been awake for hours thinking",
                "My mind just keeps going",
                "Too restless to relax",
                "Cant turn my brain off",
                "Lying awake for hours",
                "Feel wired but exhausted",
                "Cant stop my thoughts racing",
                "Too amped up to sleep",
                "My body wont settle down",
                "Cant find any peace",
                "Mind racing a million miles an hour",
                "Too on edge to rest",
                "Feeling jumpy and restless",
                "Cant get into a good sleep",
                "Up all night overthinking",
                "Feel like i need to move constantly",
                "Cant quiet my mind",
                "Restless energy wont go away",
                "Sleep is impossible tonight"
            ],
            
            positive: [
                "I'm feeling pretty good today",
                "Things are going well",
                "I'm happy and calm",
                "Just vibing right now",
                "Feeling blessed",
                "Life is good",
                "I'm in a great mood",
                "Feeling peaceful",
                "Everything's clicking today",
                "I'm content and relaxed",
                "Im feeling amazing today",
                "Everything is going right",
                "Life is treating me well",
                "Im in such a good mood",
                "Feeling happy and content",
                "Things are looking up",
                "Im having a great day",
                "Feel so peaceful and calm",
                "Loving life right now",
                "Everything just feels right",
                "Im grateful for today",
                "Feeling positive about everything",
                "My mood is on point",
                "Im vibing so hard rn",
                "Life feels good finally",
                "Im smiling more lately",
                "Things are going my way",
                "Im feeling optimistic",
                "Such a chill and happy mood",
                "Im doing really well today"
            ]
        };
    }
    
    // Initialize the model
    async initialize() {
        console.log('🧠 Loading TensorFlow model...');
        
        try {
            // Load Universal Sentence Encoder
            console.log('   ⏳ Loading sentence encoder...');
            this.encoder = await use.load();
            console.log('   ✅ Sentence encoder loaded');
            
            // Create and train the classification model
            console.log('   ⏳ Creating neural network...');
            await this.createModel();
            console.log('   ✅ Neural network created');
            
            console.log('   ⏳ Training model (this may take 10-15 seconds)...');
            await this.trainModel();
            console.log('   ✅ Model trained');
            
            this.isReady = true;
            console.log('✅ TensorFlow mood classifier ready!');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error loading TensorFlow model:', error);
            this.isReady = false;
            return false;
        }
    }
    
    // Create the neural network model
    async createModel() {
        this.model = tf.sequential({
            layers: [
                // Input layer (512 dimensions from Universal Sentence Encoder)
                tf.layers.dense({
                    inputShape: [512],
                    units: 128,
                    activation: 'relu'
                }),
                
                // Hidden layer with dropout to prevent overfitting
                tf.layers.dropout({ rate: 0.3 }),
                
                tf.layers.dense({
                    units: 64,
                    activation: 'relu'
                }),
                
                // Output layer (6 mood categories)
                tf.layers.dense({
                    units: this.moods.length,
                    activation: 'softmax'
                })
            ]
        });
        
        // Compile the model
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
    }
    
    // Train the model with sample data
    async trainModel() {
        // Prepare training data
        const sentences = [];
        const labels = [];
        
        this.moods.forEach((mood, moodIndex) => {
            this.trainingData[mood].forEach(sentence => {
                sentences.push(sentence);
                
                // Create one-hot encoded label
                const label = Array(this.moods.length).fill(0);
                label[moodIndex] = 1;
                labels.push(label);
            });
        });
        
        // Encode sentences
        const embeddings = await this.encoder.embed(sentences);
        const labelsTensor = tf.tensor2d(labels);
        
        // Train the model
        await this.model.fit(embeddings, labelsTensor, {
            epochs: 50,
            batchSize: 8,
            validationSplit: 0.2,
            verbose: 0, // Set to 1 if you want to see training progress
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`      Epoch ${epoch}: accuracy = ${(logs.acc * 100).toFixed(1)}%`);
                    }
                }
            }
        });
        
        // Clean up tensors
        embeddings.dispose();
        labelsTensor.dispose();
    }
    
    // Classify a user's message
    async classify(text) {
        if (!this.isReady) {
            console.warn('⚠️ TensorFlow model not ready');
            return null;
        }
        
        try {
            // Encode the input text
            const embedding = await this.encoder.embed([text]);
            
            // Get predictions
            const prediction = this.model.predict(embedding);
            const probabilities = await prediction.data();
            
            // Find the mood with highest probability
            let maxProb = 0;
            let predictedMoodIndex = 0;
            
            probabilities.forEach((prob, index) => {
                if (prob > maxProb) {
                    maxProb = prob;
                    predictedMoodIndex = index;
                }
            });
            
            // Clean up tensors
            embedding.dispose();
            prediction.dispose();
            
            // Get recommended features for this mood
            const predictedMood = this.moods[predictedMoodIndex];
            const features = this.getRecommendedFeatures(predictedMood);
            
            return {
                mood: predictedMood,
                confidence: maxProb,
                features: features,
                method: 'tensorflow',
                allProbabilities: this.moods.map((mood, i) => ({
                    mood: mood,
                    probability: probabilities[i]
                }))
            };a
            
        } catch (error) {
            console.error('Error classifying mood:', error);
            return null;
        }
    }
    
    // Get recommended features for a mood
    getRecommendedFeatures(mood) {
        const featureMap = {
            anxious: ['breathing', 'mini-game', 'calming-video'],
            sad: ['affirmations', 'uplifting-video', 'journal'],
            angry: ['breathing', 'stretch', 'mini-game'],
            tired: ['stretch', 'calming-video', 'breathing'],
            restless: ['breathing', 'calming-video', 'stretch'],
            positive: ['affirmations', 'mini-game', 'journal']
        };
        
        return featureMap[mood] || ['breathing', 'mini-game'];
    }
}

// Create global instance
const tensorFlowClassifier = new TensorFlowMoodClassifier();

// Make it available globally
window.tensorFlowClassifier = tensorFlowClassifier;

console.log('📦 TensorFlow classifier module loaded');