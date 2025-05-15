// DOMcontentloaded event listener for animated background 
document.addEventListener('DOMContentLoaded', function() {
  const animatedBackground = document.getElementById('animated-background');

  function playVideo() {
      animatedBackground.style.display = 'block';
      animatedBackground.play();
      animatedBackground.onended = function() {
          setTimeout(() => {
              animatedBackground.currentTime = 0; // Reset video to start
              playVideo();
          }, 30000); // Stay at the last frame for 30 seconds
      };
  }

  // Play the video once when the page loads
  playVideo();
});

// DOMcontentloaded event listener hamburger(mobile menu)
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  const navE1 = document.querySelector('.nav');
  const hamburgerE1 = document.querySelector('.hamburger');
  const mediaQuery = window.matchMedia('(max-width: 650px)');

  const isHeaderSticky = () => {
      return header.getBoundingClientRect().top === 0;
  };

  const toggleHamburgerVisibility = () => {
      if (isHeaderSticky() && mediaQuery.matches) {
          hamburgerE1.classList.add('visible');
          hamburgerE1.style.pointerEvents = 'auto'; // Enable interaction
      } else {
          hamburgerE1.classList.remove('visible');
          hamburgerE1.style.pointerEvents = 'none'; // Disable interaction
          navE1.classList.remove("nav--open"); // Automatically close nav
          hamburgerE1.classList.remove("hamburger--open"); // Automatically close hamburger
      }
  };

  // Check visibility on scroll and media query change
  window.addEventListener('scroll', toggleHamburgerVisibility);
  mediaQuery.addEventListener('change', toggleHamburgerVisibility);
  // Initial check
  toggleHamburgerVisibility();

  hamburgerE1.addEventListener('click', () => {
      if (isHeaderSticky()) {
          console.log('Hamburger clicked while header is sticky');
          navE1.classList.toggle("nav--open");
          hamburgerE1.classList.toggle("hamburger--open");
      } else {
          console.log('Hamburger clicked while header is not sticky');
      }
  });

  navE1.addEventListener('click', () => {
      if (isHeaderSticky()) {
          console.log('Nav clicked while header is sticky');
          navE1.classList.remove("nav--open");
          hamburgerE1.classList.remove("hamburger--open");
      } else {
          console.log('Nav clicked while header is not sticky');
      }
  });
});

// typing effect
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var i = 0;
    var txt = 'Your one-stop site to learn everything about multiplexers.'; /* The text */
    var speed = 30; /* The speed/duration of the effect in milliseconds */

    function typeWriter() {
      if (i < txt.length) {
        document.getElementById("subtitle").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    }

    typeWriter();
  }, 300); // 1 second delay
});

//practice question 1 verification
document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.querySelector('#answer_one');
    const submitButton = document.querySelector('.submit_one');
    const correctAnswer = [0, 1, 5, 7];
    const correctAnswerSet = new Set(correctAnswer);

    submitButton.addEventListener('click', function() {
        const userInput = answerInput.value.trim();
        
        // Check if the input is valid
        if (!/^[0-9,\s]*$/.test(userInput)) {
            alert('Invalid answer');
            return;
        }

        // Convert the input string to an array of numbers
        const userArray = userInput.split(',').map(num => num.trim()).filter(num => num !== '').map(Number);

        // Check for duplicates
        const uniqueArray = [...new Set(userArray)];
        if (uniqueArray.length !== userArray.length) {
            alert('Duplicate terms');
            return;
        }

        // Verify the answer
        const userAnswerSet = new Set(userArray);
        let isCorrect = true;

        for (let num of userArray) {
            if (!correctAnswerSet.has(num)) {
                isCorrect = false;
                break;
            }
        }

        if (isCorrect && userAnswerSet.size === correctAnswerSet.size) {
            alert('Correct answer');
        } else {
            alert('Wrong answer, Try again.');
        }
    });
});

//practice question 2 verification
document.addEventListener('DOMContentLoaded', function() {
    const answerInput = document.querySelector('#answer_two');
    const submitButton = document.querySelector('.submit_two');
    const correctAnswer = [5, 7, 12, 13, 15];
    const correctAnswerSet = new Set(correctAnswer);

    submitButton.addEventListener('click', function() {
        const userInput = answerInput.value.trim();
        
        // Check if the input is valid
        if (!/^[0-9,\s]*$/.test(userInput)) {
            alert('Invalid answer');
            return;
        }

        // Convert the input string to an array of numbers
        const userArray = userInput.split(',').map(num => num.trim()).filter(num => num !== '').map(Number);

        // Check for duplicates
        const uniqueArray = [...new Set(userArray)];
        if (uniqueArray.length !== userArray.length) {
            alert('Duplicate terms');
            return;
        }

        // Verify the answer
        const userAnswerSet = new Set(userArray);
        let isCorrect = true;

        for (let num of userArray) {
            if (!correctAnswerSet.has(num)) {
                isCorrect = false;
                break;
            }
        }

        if (isCorrect && userAnswerSet.size === correctAnswerSet.size) {
            alert('Correct answer');
        } else {
            alert('Wrong answer, Try again.');
        }
    });
});