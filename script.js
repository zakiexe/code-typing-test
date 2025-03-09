const snippets = [
    `function factorial(n) {
      if (n === 0) return 1;
      return n * factorial(n - 1);
    }
    
    console.log(factorial(5));`,
    
    `function isPrime(num) {
      if (num <= 1) return false;
      
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
      }
      
      return true;
    }
    
    console.log(isPrime(23));`,
    
    `const numbers = [1,2,3,4,5];
    let sum = numbers.reduce((acc, val) => acc + val,0);
    console.log(sum);`
    ];
    
    let snippetEditor, typingEditor;
    let currentSnippet = "";
    let timer, timeLeft = 60, testStarted = false;
    
    const timerDisplay = document.getElementById("timer");
    const wpmDisplay = document.getElementById("wpm");
    const accuracyDisplay = document.getElementById("accuracy");
    const themeToggle = document.getElementById("theme-toggle");
    const restartButton = document.getElementById("restart-button");
    
    // Initialize editors
    function initEditors() {
      snippetEditor = CodeMirror.fromTextArea(document.getElementById("snippet-editor"), {
        mode: "javascript",
        theme: "eclipse",
        lineNumbers: true,
        readOnly: true,
        lineWrapping: true
      });
    
      typingEditor = CodeMirror.fromTextArea(document.getElementById("typing-editor"), {
        mode: "javascript",
        theme: "eclipse",
        lineNumbers: true,
        lineWrapping: true
      });
    
      typingEditor.on("change", handleTyping);
    }
    
    // Handle typing input
    function handleTyping() {
      if (!testStarted) {
        startTest();
        testStarted = true;
      }
    
      const typedText = normalizeText(typingEditor.getValue());
      
      updateStats(typedText);
      
      highlightMistakesInSnippet(typedText);
    
      if (typedText === normalizeText(currentSnippet)) endTest();
    }
    
    // Normalize text by removing leading spaces and newlines
    function normalizeText(text) {
      return text.split("\n").map(line => line.trimStart()).join("\n");
    }
    
    // Update WPM and accuracy
    function updateStats(typedText) {
      let correctChars = typedText.split("").filter((char, idx) => char === normalizeText(currentSnippet)[idx]).length;
    
      let elapsedMinutes = (60 - timeLeft) /60 || (1 /60);
      
      let wpm = Math.round((correctChars /5)/elapsedMinutes);
      
      let accuracy = Math.round((correctChars / typedText.length)*100);
    
      wpmDisplay.textContent=wpm||"0";
      
      accuracyDisplay.textContent=accuracy||"0";
    }
    
    // Highlight mistakes directly in the snippet editor
    function highlightMistakesInSnippet(typedText) {
     snippetEditor.operation(()=>{
       snippetEditor.getDoc().setValue(normalizeText(currentSnippet));
       
       for(let i=0;i<typedText.length;i++){
         let expectedChar=normalizeText(currentSnippet)[i];
         let actualChar=typedText[i];
         
         let fromPos=snippetEditor.posFromIndex(i);
         let toPos=snippetEditor.posFromIndex(i+1);
         
         if(actualChar===expectedChar){
           snippetEditor.markText(fromPos,toPos,{className:"cm-correct"});
         }else{
           snippetEditor.markText(fromPos,toPos,{className:"cm-incorrect"});
         }
       }
     });
    }
    
    // Start the timer
    function startTest() {
     timer=setInterval(()=>{
       timeLeft--;
       timerDisplay.textContent=timeLeft;
    
       if(timeLeft<=0)endTest();
     },1000);
    }
    
    // End the test
    function endTest() {
     clearInterval(timer);
     typingEditor.setOption("readOnly",true);
    }
    
    // Restart test
    restartButton.onclick=()=>location.reload();
    
    // Theme toggle
    themeToggle.onclick=()=>{
     document.body.classList.toggle("dark-mode");
     let theme=document.body.classList.contains("dark-mode")?"dracula":"eclipse";
     snippetEditor.setOption("theme",theme);
     typingEditor.setOption("theme",theme);
    };
    
    // Initialize everything
    window.onload=()=>{
     currentSnippet=snippets[Math.floor(Math.random()*snippets.length)];
     initEditors();
     snippetEditor.setValue(currentSnippet);
    };
    