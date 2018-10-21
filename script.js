/*
TODO:

- xml albo json
*/

const hashtagContainer = document.querySelector("#hashContainer");
const tagInput = document.querySelector("#tagInput");
const addButton = document.querySelector("#addButton");
const sendButton = document.querySelector("#sendButton");
const suggestions = document.querySelector("#suggestions");
const tagList = document.querySelector("#tagList");
let cloudTags;


let basicFontSize = 14;
let htmlContent = '';
let selectedTags = [];
hashtagContainer.innerHTML = "";

let hashtags;

/*
  Load local json file
*/
function loadJSON(callback) {
  let xmlObj = new XMLHttpRequest();
  xmlObj.overrideMimeType("application/json");
  xmlObj.open('GET', 'tags.json', false);
  xmlObj.onreadystatechange = _ => {
    if(xmlObj.readyState == 4 && xmlObj.status == "200") {
      callback(xmlObj.responseText);
    }
  };
  xmlObj.send(null);
}

loadJSON((resp) => {
  let jsonFile = JSON.parse(resp);
  hashtags = jsonFile;
  
})

console.log(hashtags)
/*
  Calculates font size for each tag
*/
function calculateFontSize(frequency) {
  let fontSize = Math.floor(basicFontSize*frequency*0.25);
  return (fontSize < basicFontSize) ? basicFontSize : fontSize;
}

/*
  Generates DOM for tagcloud. Each single tag is in its own <a> tag
*/
function generateHashCloud() {
  htmlContent='';
    for(let i = 0; i < hashtags.length; i++) {
    htmlContent += `<a href="#" class="hashtags__tag hashtags__tag--size${calculateFontSize(hashtags[i].number)}" id="${hashtags[i].tag}">${hashtags[i].tag}</a>`;
    }

    hashtagContainer.innerHTML = htmlContent;
    cloudTags = hashtagContainer.querySelectorAll("a");
}

/*
  Filters tags array and returns new array with values, that match given regexp
*/
function findMatches(tagToMatch, hashtags) {
  return hashtags.filter(tag => {
    const regex = new RegExp(tagToMatch, 'gi');
    return tag.tag.match(regex);
  })
}

function addExistingTag(tagName) {
  const html = `<p class="tag-element" id="selectedList-${tagName}">${tagName}<span class="close">&times</span></p>`;
  tagList.innerHTML += html;
  selectedTags.push(tagName);
  suggestions.innerHTML = '';
  tagInput.value = '';
}

/*
  Function for new tag, that isn't in "database".
  1. Check if tag isn't already used
  If true:
  2. Add given tag to hashtags array
  3. Generate new tagcloud
  4. Add given tag to used tag list in DOM
  5. Add given tag to used tag list in array
  6. Reset input
*/
function addNewTag(newTag) {
  let html = '';
  tagInput.value = '';
  if(selectedTags.indexOf(newTag) == -1) {
    hashtags.push({tag: newTag, number: 0});
    addExistingTag(newTag.toLowerCase());
  }
}


function containsTag(tag, tagArray) {
  let contains = false;
  tagArray.forEach((tagElement) => {
    if(tagElement.tag == tag) {
      contains = true;
    }
  })

  return contains;
}
/*
  Function for displaying matches while typing in input field
  1. Check if user hit Backspace AND if input is empty
    If true:
    1. Clear suggestions list
  2. Check if user hit Enter
    If true:
    1. Add typed tag to lists (to fix)
  3. Else
    1. Create array with values that match given regexp created with letters typed by user
    2. Iterate over array above and creates <li> nodes with higlighted letters that are typed
*/
function displayMatches(evt) {
  let html = '';
  let matchArray = [];
  if(evt.which == 8 && tagInput.value.length == 0) {
    html = '';
  } else if(evt.which == 13) {
    if(!containsTag(tagInput.value, hashtags)) {
      addNewTag(tagInput.value.toLowerCase());
    } else {
      addExistingTag(tagInput.value.toLowerCase())
      hashtags.forEach((tagElement) => {
        if(tagElement.tag == tagInput.value.toLowerCase()) {
          tagElement.number++;
        }
      })
    }
  } else {
    matchArray = findMatches(tagInput.value, hashtags);
    html = matchArray.map(tag => {
      const regex = new RegExp(tagInput.value, 'gi');
      const tagName = tag.tag.replace(regex, `<span class="suggestions__tag-name--hl">${tagInput.value}</span>`);
      return `<li class="suggestions__tag-name" id="tag-${tag.tag}">
                ${tagName}
              </li>`
    }).join('');
    
  }
  suggestions.innerHTML = html;
}


tagInput.addEventListener('change', (e) => displayMatches(e));
tagInput.addEventListener('keyup', (e) => displayMatches(e));
addButton.addEventListener('click', () => {
  if(containsTag(tagInput.value, hashtags)) {
    addExistingTag(tagInput.value.toLowerCase())
  } else {
    addNewTag(tagInput.value);
  }
});
document.addEventListener('mouseup', (e) => {
  if(e.target.classList.contains("close")) {
    e.target.parentNode.remove();
    selectedTags.splice(selectedTags.indexOf(e.target.parentNode.id.slice(13)), 1);
  } else if(e.target.classList.contains("suggestions__tag-name")) {
    if(selectedTags.indexOf(e.target.innerText) == -1) {
      addExistingTag(e.target.innerText.toLowerCase());
    }
    tagInput.value = '';
  }

});
sendButton.addEventListener('click', () => {
  tagList.innerHTML = '';
  for(let i = 0; i < selectedTags.length; i++) {
    hashtags.forEach((tagItem) => {
      if(tagItem.tag == selectedTags[i]) {
        tagItem.number++;
      }
    })
  }
  selectedTags.length = 0;
  generateHashCloud();
  
})

generateHashCloud();

cloudTags.forEach((node) => {
  node.addEventListener("click", (evt) => {
    if(!selectedTags.includes(evt.target.id)) {
      tagList.innerHTML += `<p class="tag-element" id="selectedList-${evt.target.id}">${evt.target.id}<span class="close">&times</span></p>`;
      selectedTags.push(evt.target.id);
    }
  })
})

