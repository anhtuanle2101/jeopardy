// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let clickable=true;
const NUM_CATEGORIES=6;
const NUM_QUESTIONS_PER_CAT=5;


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const URL=`http://jservice.io/api/categories`
    const offset=Math.floor(Math.random()*101);
    const res=await axios.get(URL,{params:{count:NUM_CATEGORIES,offset}});
    return res.data.map(data=>data.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const URL=`http://jservice.io/api/category`;
    const res=await axios.get(URL,{params:{id:catId}});
    let count=0;
    return {
        title:res.data.title,
        clues:res.data.clues.map(({question,answer})=>{
            return {
                question,
                answer,
                showing:null
            }
        }).filter(data=>{
            count++;
            return count<=5;
        })
    }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const gametable=document.querySelector('.game-table');
    const newTHead=document.createElement('thead');
    const newTBody=document.createElement('tbody');
    const newTr=document.createElement('tr');
    for(let i=0;i<NUM_CATEGORIES;i++){
        const newTd=document.createElement('td');
        newTd.innerText=(await categories[i]).title;
        newTr.append(newTd);
    }
    newTHead.append(newTr);
    for(let i=0;i<NUM_QUESTIONS_PER_CAT;i++){
        const newTr2=document.createElement('tr');
        for(let j=0;j<NUM_CATEGORIES;j++){
            const newTd=document.createElement('td');
            newTd.textContent='?';
            newTd.classList.add('quiz');
            newTd.setAttribute('data-index',`${j}${i}`)
            newTr2.append(newTd);
        }
        newTBody.append(newTr2);
    }
    gametable.append(newTHead,newTBody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

async function handleClick(evt) {
    if (evt.target.classList.contains('quiz')&&clickable){
        const catIdx=parseInt(evt.target.getAttribute('data-index')[0]);
        const clueIdx=parseInt(evt.target.getAttribute('data-index')[1]);
        const {question,answer,showing}=(await categories[catIdx]).clues[clueIdx];
        if (showing === null){
            (await categories[catIdx]).clues[clueIdx].showing='question';
            evt.target.innerHTML=question;
        }else if (showing==='question'){
            (await categories[catIdx]).clues[clueIdx].showing='answer';
            evt.target.innerHTML=answer;
        }else if (showing==='answer'){
            console.log((await categories[catIdx]).clues[clueIdx]);
            
        }
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    categories=[];
    clickable=false;
    document.querySelector('table').innerText='';
    document.querySelector('.main').classList.add('blurred');
    document.querySelector('.spinner').classList.remove('hidden');
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
    document.querySelector('.main').classList.remove('blurred');
    document.querySelector('.spinner').classList.add('hidden');
    clickable=true;
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    categories=(await getCategoryIds()).map(async function(id){
        return await getCategory(id);
    });
    setTimeout(function(){
        hideLoadingView();
    },1200);
    fillTable();
}

/** On click of start / restart button, set up game. */
document.querySelector('.start-btn').addEventListener('click',function(e){
    if (clickable){
        e.preventDefault();
        setupAndStart();
    }
});
// TODO

/** On page load, add event handler for clicking clues */
document.addEventListener('DOMContentLoaded',function(){
    document.querySelector('table').addEventListener('click',e=>handleClick(e));
})
// TODO