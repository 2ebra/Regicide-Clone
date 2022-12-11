
const suits = ["Spades", "Diamonds", "Clubs", "Hearts"]
const values = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    "Jack",
    "Queen",
    "King",
  ]
const health = []
const attack = []

const handAreaEl = document.getElementById("hand-area")
const bossCardEl = document.getElementById("boss-card")
const playedCardsEl = document.getElementById("played-cards")

const actionBtn = document.getElementById("action-btn")

const notification = document.getElementById("notification")
const closeBtn = document.getElementById("close")

let players = 1
let handSize = 7
let cardsAll = []
let cardsHand = []
let cardsDiscard = []
let cardsSelected = []
let bossDeck = []
let bossInPlay =[]
let cardsPlayed =[]
let cardsPlayedDmg = 0

let dmgToTake = 0
let dmgDouble = false
let dmgBlocked = 0


function startGame() {
    createCardsAll()
    drawCard(handSize)
    updateCards()
    drawBoss()
}



function createCardsAll() {
    // Creates each individual card in orde excluding Jacks, Queens and Kings
    for (let i = 0; i < suits.length; i++) {
        for (let x = 0; x < values.length-3; x++) {
            let card = { Value: values[x], Suit: suits[i], Attack: values[x]};
            cardsAll.push(card);
        }
    }
    //Shuffles deck
    shuffleCards(cardsAll)

    //creates each individual boss card
    for (let i = 10; i < values.length; i++) {
        for (let x = 0; x < suits.length; x++) {
            let card = { Value: values[i], Suit: suits[x], Attack: attack[1], Health: health[1]};
            bossDeck.push(card);
        }
    }

    let jacksDeck = []
    let queensDeck = []
    let kingsDeck = []

    //Separates
    prepBoss(kingsDeck)
    prepBoss(queensDeck)
    prepBoss(jacksDeck)

    //Recombines them back into the Boss Deck Shuffled
    bossDeck = [...jacksDeck, ...queensDeck, ...kingsDeck]
}

function prepBoss(prepBossDeck) {
    //Separate
    for (i = 0; i < 4 ; i++) {
        prepBossDeck.push(bossDeck.pop())

        if(prepBossDeck[i].Value === "Jack"){
            prepBossDeck[i].Attack = 10
            prepBossDeck[i].Health = 20
        }
        if(prepBossDeck[i].Value === "Queen"){
            prepBossDeck[i].Attack = 15
            prepBossDeck[i].Health = 30
        }
        if(prepBossDeck[i].Value === "King"){
            prepBossDeck[i].Attack = 20
            prepBossDeck[i].Health = 40
        }

    }
    //Shuffle deck
    shuffleCards(prepBoss)

    return prepBossDeck
}


function shuffleCards(specificDeck) {
    for (let i = specificDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        let temp = specificDeck[i];
        specificDeck[i] = specificDeck[j];
        specificDeck[j] = temp;
    }
    
    return specificDeck
}


function drawBoss() {
    cardsPlayedDmg = 0
    dmgBlocked = 0

    discardCards(bossInPlay)

    if (bossDeck.length) {
        bossInPlay.push(bossDeck.shift())
    }
    
    bossCardEl.innerHTML = "<div class='card'><div class='corner-el'>" + bossInPlay[0].Value + "</div><div class='center-img-el "  + bossInPlay[0].Suit + "-el'></div></div>"
    //console.log("---BOSS IN PLAY---")
    //console.log(bossInPlay[0].Value + " of " + bossInPlay[0].Suit)
    //console.log("HP: "+ bossInPlay[0].Health )
}


function drawCard(numCards){

   
    for (i = numCards; i > 0; i--) {
        if (cardsAll.length > 0  && cardsHand.length < handSize){
            cardsHand.push(cardsAll.shift());
        }
        else if (cardsHand.length === handSize) {
            
            console.log("Can't have more than " + handSize +" cards in your hand.")
        }
        else {
            console.log("There are no more cards to draw")
        }   
    }

}


function selectCard(selectedCard) {
    //Select the cards you want to play
    if (selectedCard.id === "not-selected") {

        //Check if its a valid combo card or animal combo
        //If not throw up error informing they can only select cards of same value that equal under 10 when added together
        selectedCard.id = 'selected'


    }
    else {
        selectedCard.id = 'not-selected'
    }
}

function playCards(){
    //Plays selected cards
    let temp = []
    x = areCardsSelected()
    y = areCardsSelectedValid()

    // If there are cards selected
    if(x === true) {
        if (y === true) {
            for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
                let j = cardsPlayed.length

                if (handAreaEl.childNodes[i].id === "selected") {

                    cardsPlayed[j] = cardsHand[i]
                    cardsHand.splice(i,1)


                    cardsPlayedDmg += cardsPlayed[j].Value
                }
            }  

            damagePhase(bossInPlay[0].Health, cardsPlayedDmg)
            updateCards()

        }

    }
    // If no cards are selected
    else{
        console.log("No cards selected")
    }
}

function damagePhase(bossHp,cardsDmg) {

    if(dmgDouble){

/*  DOUBLE DMG IS DOUBLEING ALL CURRENT A PRIOR DAMAGE */

       cardsDmg += cardsDmg
    }

        currentHp = bossHp - cardsDmg


    console.log("DAMAGE: "+ cardsDmg)
    console.log("HP: "+ currentHp )

    if (currentHp === 0) {
        
        cardsAll.unshift(bossInPlay[0])
        
        discardCards(cardsPlayed)
        console.log("You strike the boss for the exact amount")
        
        drawBoss()

    }
    else if (currentHp < 0) {

        discardCards(cardsPlayed)
        console.log("You defeat the boss")
        drawBoss()

    }
    else {

        takeDamage()

    }
    //If Boss still alive take damage minus shields (spades)
    //Keep cards in play for next round
    //if Boss dead:
    //If dealt exact damage. place Boss on top of cardsAll else cardsDiscarded
    //Discard played cards

}


function takeDamage() {
    dmgToTake = bossInPlay[0].Attack - dmgBlocked 
    console.log("MUST PLAY CARDS GREATER THAN OR EQUAL TO: " + dmgToTake)

    if(dmgToTake > 0) {
        //swap to Playing Damage Cards
        actionBtn.innerHTML = `<button onclick="playDmgCards()">PLAY CARDS</button>`
    }
    else {
        console.log("You block all damage")
    }   
}

function notificationMessage(message) {



}






function playDmgCards () {
    let dmgCardsPlayed = []
    let dmgMitigated = 0

    x = areCardsSelected()
    // If there are cards selected
    if(x === true) {
        for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
            if (handAreaEl.childNodes[i].id === "selected") {

                let j = dmgCardsPlayed.length

                dmgCardsPlayed[j] = cardsHand[i]

                dmgMitigated += dmgCardsPlayed[j].Attack
            }
        }
        
        console.log(dmgMitigated + " DAMAGE MITIGATED")

        if (dmgMitigated >= dmgToTake) {
            dmgCardsPlayed.length = 0

            for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
                let j = dmgCardsPlayed.length
                if (handAreaEl.childNodes[i].id === "selected") {
     
                    dmgCardsPlayed[j] = cardsHand[i]
                    cardsHand.splice(i,1)
                }
            }
            discardCards(dmgCardsPlayed)

            updateCards()
            console.log(dmgToTake + " DAMAGE TAKEN")
            actionBtn.innerHTML = `<button onclick="playCards()">PLAY CARDS</button>`

        }
        else {
            let dmgRemaining = dmgToTake - dmgMitigated
            console.log("Still " + dmgRemaining + " damage left to take")
        }
    }
    // If no cards are selected
    else{
        console.log("No cards selected")
    }
}

function discardCards(specificDeck){
    //NEED TO MOVE CARDS INTO NEW ARRAY
    for (i = specificDeck.length - 1; i >= 0; i--) {
        let j = cardsDiscard.length

        cardsDiscard[j] = specificDeck[i]
        specificDeck.push()
    }

    specificDeck.length = 0

    console.log("DISCARDED: " + cardsDiscard.length)
}


function updateCards() {
    // Cards in Hand
    let cardsHandList = ""

    //console.log("--CARDS IN HAND --")
    for (let i = 0; i < cardsHand.length; i++){
        //console.log(cardsHand[i].Value + " of "+ cardsHand[i].Suit)
        cardsHandList += `<div class='card' id='not-selected' onclick='selectCard(this)'><div class='corner-el'>${cardsHand[i].Value}</div><div class='center-img-el ${cardsHand[i].Suit}-el'></div><div class='corner-bot-el'>${cardsHand[i].Value}</div></div>`
    }

    handAreaEl.innerHTML = cardsHandList

    //Cards in play
    let cardsPlayedList = ""

    //console.log("--CARDS IN PLAY--")
    for (let i = 0; i < cardsPlayed.length; i++){
        //console.log(cardsPlayed[i].Value + " of "+ cardsPlayed[i].Suit)
        cardsPlayedList += "<div class='card'><div class='corner-el'>" + cardsPlayed[i].Value + "</div><div class='center-img-el "  + cardsPlayed[i].Suit + "-el'></div></div>"
    }

    playedCardsEl.innerHTML = cardsPlayedList
}


function areCardsSelected () {
    // Checks to see if any cards are selected
    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = cardsPlayed.length
        
        if(handAreaEl.childNodes[i].id === "selected") {
            return true
        }
    }
    return false
}

function areCardsSelectedValid() {

    let temp = []
    let tempAdded = 0

    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
            tempAdded += temp[j].Value
        }
    }  

    // If less than or equal to 10 return true
    if(tempAdded <= 10) {

        if(areCardsSelectedValidSuit() === true){
            checkCardPower()
            return true;
        }
        else {
            return false;
        }
    }
    else{
        console.log("Cards selected can't add up to more than 10")
        return false
    }
}

function areCardsSelectedValidSuit() {
    let temp = []

    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
        }
    } 

    console.log(temp)

    for (i = 0; i < temp.length; i++) {
        let j = temp.length-1

        if(temp[i].Value != 1  &&  temp[j].Value != 1 ) {
            if(temp[i].Value != temp[j].Value) {
                console.log("Invalid Combo")
                return false
            }
            else {
                console.log("Valid Combo")
                return true
            }
        }
        else {
            console.log("Valid Combo")
            return true
        }
    }
}

function checkCardPower() {
    let temp = []

    let heartsNum = false
    let clubsNum = false
    let spadesNum = false
    let diamondsNum = false

    dmgDouble = false

    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
        }
    } 

    for(i = 0; i < temp.length; i++) {

        //Checks if there are cards that are Hearts
        if(temp[i].Suit === "Hearts")
        {
            if(bossInPlay[0].Suit!="Hearts"){
                heartsNum = true
            }
            else{
                console.log("Boss blocked your Heart Power")
            }
                
        }
        //Clubs
        else if(temp[i].Suit === "Clubs")
        {
            if(bossInPlay[0].Suit!="Clubs"){
                clubsNum = true
            }
            else{
                console.log("Boss blocked your Club Power")
            }
        }
        //Spades
        else if(temp[i].Suit === "Spades")
        {
            if(bossInPlay[0].Suit!="Spades"){
                spadesNum = true
            }
            else{
                console.log("Boss blocked your Spade Power")
            }
        }
        //Diamonds
        else 
        {
            if(bossInPlay[0].Suit!="Diamonds"){
                diamondsNum = true
            }
            else{
                console.log("Boss blocked your Diamond Power")
            }
        }
    }

    if (heartsNum) {
        heartPower()
    }

    if(diamondsNum){
        diamondPower()
    }

    if (clubsNum) {
        clubPower()
    }

    if(spadesNum){
        spadePower()
    }


}


function heartPower() {
    let temp = []
    howMany = 0

    console.log("Heart Power Activated")

    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
        }
    } 

    for (i=0; i<temp.length; i++) {
        howMany +=temp[i].Attack
    }

    //Shuffle Discard
    shuffleCards(cardsDiscard)

    //Move from cardsDiscard to bottom of cardsAll equal to attack value
    if(cardsDiscard.length > 0) {
        for(i=0; i < howMany; i++){
            cardsAll.push(cardsDiscard.pop)
        }
    }
}

function diamondPower() {
    let temp = []
    howMany = 0

    console.log("Diamond Power Activated")


    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
        }
    } 

    for(i=0; i < temp.length; i++){
        howMany += temp[i].Attack
    }

    if (cardsHand.length === handSize){
        handSize += 1
        drawCard(howMany)
        handSize -=1
    }
    else{
        drawCard(howMany)
    }
    
}

function clubPower() {
    console.log("Club Power Activated")
    dmgDouble = true
}

function spadePower() {
    let temp = []

    console.log("Spade Power Activated")


    for (i = handAreaEl.childNodes.length - 1; i >= 0; i--) {
        let j = temp.length

        if (handAreaEl.childNodes[i].id === "selected") {

            temp[j] = cardsHand[i]
        }
    } 

    for(i=0; i < temp.length; i++){
        dmgBlocked += temp[i].Attack
    }
 
}







//Start Game

startGame()