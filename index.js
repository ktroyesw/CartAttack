const canvas = document.getElementById('myCanvas')
const c = canvas.getContext('2d');
const scoreElement = document.getElementById("score")
const startGameBtn = document.getElementById("startGameBtn")
const startGameModal = document.getElementById("startGameModal")
const restartGameBtn = document.getElementById("restartGameBtn")
const endGameModal = document.getElementById("endGameModal")
const finalScore = document.getElementById("finalScore")
const messageText = document.getElementById("messageText")

const imgBackground = new Image(0,0)
imgBackground.src = './TarteBackground2.png'

// Sounds
const playerExplosionSound  = "./Explosion2.mp3" // Player Expoded
const enemyExplosionSound  = "./Explosion1.mp3" // Enemy Expoded
const addToBasketSound = "./AddToTrolley.mp3" // Goodie in Basket
const playerFireSound =  "./Fire2.mp3" // Player Fires Weapon
const backgroundMusicSound = "./music.mp3" // Background Music

// Player Setup
const imgPlayer = new Image()
imgPlayer.src = 'Basket3.png'
const playerSettings = {image:imgPlayer, width:50, height:50}


// Enemy Setup
const imgEnemy1 = new Image()
imgEnemy1.src = 'Monster01.png'

const imgEnemy2 = new Image()
imgEnemy2.src = 'Monster02.png'

const imgEnemy3 = new Image()
imgEnemy3.src = 'Monster03.png'

const enemy1 = { image:imgEnemy1, width:25, height:25 }
const enemy2 = { image:imgEnemy2, width:25, height:25 } 
const enemy3 = { image:imgEnemy3, width:25, height:25 }


// Goodie Setup
const imgGoodie1 = new Image()
imgGoodie1.src = 'TarteFaceTape.png'

const imgGoodie2 = new Image()
imgGoodie2.src = 'TarteTool.png'

const imgGoodie3 = new Image()
imgGoodie3.src = 'TarteStaySpray.png'


const goodie1 = { image:imgGoodie1, width:25, height:75 }
const goodie2 = { image:imgGoodie2, width:40, height:40 }
const goodie3 = { image:imgGoodie3, width:20, height:75 }

canvas.width = innerWidth
canvas.height = innerHeight

let music;

startGameModal.style.display = 'none';
endGameModal.style.display = 'none';

class Player {
    constructor(centerX, centerY, velocity, player) {
        this.init(centerX, centerY, velocity, player)
    }

    init(centerX, centerY, velocity, player)
    {
        this.centerX = canvas.width / 2
        this.centerY = canvas.height / 2
        this.size = 100
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)
        this.shrinkFactor = 0
        this.velocity = velocity
        this.width = player.width
        this.height = player.height
        this.image = player.image
    }

    draw() {
        if ((this.width > 0 || this.height > 0) && this.shrinkFactor > 0) {
            this.width -= this.shrinkFactor
            this.height -= this.shrinkFactor
            this.topLeftX = this.centerX - (this.width / 2)
            this.topLeftY = this.centerY - (this.height / 2)
        }

        console.log('player this.shrinkFactor:' + this.shrinkFactor)

        if (this.width <= 0) {
            endGame(false)                
        }

        c.drawImage(this.image, this.topLeftX, this.topLeftY, this.width, this.height);  
            
    }

    startShrink(shrinkFactor = 2)     {
        this.shrinkFactor = shrinkFactor;
    }

    detectCollision(x, y) {
        return x >= this.topLeftX && x <= this.topLeftX + this.width &&
               y >= this.topLeftY && y <= this.topLeftY + this.height 
    }

    update() {

        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y

        if (this.centerX - (this.width / 2) <= 0) { 
            this.centerX = this.width / 2
            this.velocity.x = 0
        }

        if (this.centerY - (this.height / 2) <= 0) {
            this.centerY = this.height / 2
            this.velocity.y = 0
        }

        if (this.centerX + (this.width / 2) >= canvas.width) {
            this.centerX = canvas.width - (this.width / 2)
            this.velocity.x = 0
        }

        if (this.centerY + (this.height / 2) >= canvas.height) {
            this.centerY = canvas.height - (this.height / 2)
            this.velocity.y = 0
        }

        this.topLeftX = this.centerX - (this.width / 2)
        this.topLeftY = this.centerY - (this.height / 2)        
    }

    setVelocity(x, y) {
        this.velocity.x += x
        this.velocity.y += y

        const maxVelocity = 3

        if (this.velocity.x < (-1 * maxVelocity)) this.velocity.x = (-1 * maxVelocity)
        if (this.velocity.x > maxVelocity) this.velocity.x = maxVelocity

        if (this.velocity.y < (-1 * maxVelocity)) this.velocity.y = (-1 * maxVelocity)
        if (this.velocity.y > (maxVelocity)) this.velocity.y = maxVelocity
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.outOfPlay = false
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill();
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y

        if ((this.velocity.x > 0 && this.x > canvas.width + 50) ||
            (this.velocity.x < 0 && this.x < -50) ||
            (this.velocity.y > 0 && this.y > canvas.height + 50) ||
            (this.velocity.y < 0 && this.y < -50)) this.outOfPlay = true
    }
}

const friction = 0.98

class Particle {
    constructor(x, y, radius, color, velocity, strength) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.strength = strength
        this.alpha = 0.5
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill();
        c.restore()
    }

    update() {
        this.draw()

        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class Enemy {
    constructor(centerX, centerY,  velocity, strength, enemy) {
        this.centerX = centerX
        this.centerY = centerY
        this.velocity = velocity
        this.strength = strength
        this.img = enemy.image
        this.height = enemy.height
        this.width = enemy.width
        
        this.topLeftX = this.centerX - (this.with / 2)
        this.topLeftY = this.centerY - (this.height / 2)
        this.hasBeenVisible = false
        this.canBeDeleted = false
        this.shrinkFactor = 0      
        this.outOfPlay = false  
    }

    draw() {

            if ((this.width > 0 || this.height > 0) && this.shrinkFactor > 0) {
                this.width -= this.shrinkFactor
                this.height -= this.shrinkFactor
                this.topLeftX = this.centerX - (this.width / 2)
                this.topLeftY = this.centerY - (this.height / 2)
            }   

            c.drawImage(this.img, this.topLeftX, this.topLeftY, this.width, this.height);  
    }

    detectCollision(x, y) {
        return x >= this.topLeftX && x <= this.topLeftX + this.width &&
               y >= this.topLeftY && y <= this.topLeftY + this.height 

    }

    between(n,x,y) {return n >= x && n <= y;}

    detectCollision(x, y, w, h) {
        let otherTop = y - (h / 2)
        let otherBottom = y + (h / 2)
        let otherLeft = x - (w / 2)
        let otherRight = x + (w / 2)
        
        let thisTop = this.topLeftY
        let thisBottom = this.topLeftY + this.height
        let thisLeft = this.topLeftX
        let thisRight = this.topLeftX + this.width

        return  this.strength > 0 &&
                (
                    ((this.between(otherTop, thisTop, thisBottom) || this.between(otherBottom,thisTop, thisBottom)) &&
                    (this.between(otherLeft, thisLeft, thisRight) || this.between(otherRight,thisLeft, thisRight))) ||                    
                    ((this.between(thisTop, otherTop, otherBottom) || this.between(thisBottom,otherTop, otherBottom)) &&
                    (this.between(thisLeft, otherLeft, otherRight) || this.between(thisRight,otherLeft, otherRight)))
                )
    }

    startShrink(shrinkFactor = 2)     {
        this.shrinkFactor = shrinkFactor;
    }

    update() {
        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y
        this.topLeftX = this.centerX - (this.width / 2)
        this.topLeftY = this.centerY - (this.height / 2)
        
        if ((this.velocity.x > 0 && this.topLeftX > canvas.width + 50) ||
            (this.velocity.x < 0 && this.topLeftX + this.width < -50) ||
            (this.velocity.y > 0 && this.topLeftY > canvas.height + 50) ||
            (this.velocity.y < 0 && this.topLeftY + this.height < -50)) this.outOfPlay = true
    }
}

class Goodie {
    constructor(centerX, centerY, velocity, goodie) {
        this.centerX = centerX
        this.centerY = centerY        
        this.velocity = velocity
        this.height = goodie.height
        this.width = goodie.width
        this.img = goodie.image

        this.topLeftX = this.centerX - (this.width / 2)
        this.topLeftY = this.centerY - (this.height / 2)        
        this.shrink = 0
        this.scored = false
        this.outOfPlay = false

        this.shrinkX = this.width < this.height ? 1 : this.height / this.width
        this.shrinkY = this.width < this.height ? this.height / this.width : 1  
    }

    draw() {
            c.drawImage(this.img, this.centerX, this.centerY, this.width, this.height);  
            
    }

    startShrink(shrinkFactor = 2)     {
        this.shrink = shrinkFactor;
    }

    update() {        
        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y
        this.topLeftX = this.centerX - (this.width / 2)
        this.topLeftY = this.centerY - (this.height / 2)        

        if ((this.width > 0 || this.height > 0) && this.shrink > 0) {
            this.width -= (this.shrink * this.shrinkX)
            this.height -= (this.shrink * this.shrinkY)
        }  
        
        if (this.scored == false && (this.width <= 0 || this.height <= 0))
        {
            score += 1   
            scoreElement.innerHTML = score
            this.scored = true
        }

        if ((this.velocity.x > 0 && this.topLeftX > canvas.width + 50) ||
            (this.velocity.x < 0 && this.topLeftX + this.width < -50) ||
            (this.velocity.y > 0 && this.topLeftY > canvas.height + 50) ||
            (this.velocity.y < 0 && this.topLeftY + this.height < -50)) this.outOfPlay = true       
            
        
    }

    between(n,x,y) {return n >= x && n <= y;}

    detectCollision(x, y, w, h) {
        let otherTop = y - (h / 2)
        let otherBottom = y + (h / 2)
        let otherLeft = x - (w / 2)
        let otherRight = x + (w / 2)
        
        let thisTop = this.topLeftY
        let thisBottom = this.topLeftY + this.height
        let thisLeft = this.topLeftX
        let thisRight = this.topLeftX + this.width

        return ( 
                    ((this.between(otherTop, thisTop, thisBottom) || this.between(otherBottom,thisTop, thisBottom)) &&
                    (this.between(otherLeft, thisLeft, thisRight) || this.between(otherRight,thisLeft, thisRight))) ||                    
                    ((this.between(thisTop, otherTop, otherBottom) || this.between(thisBottom,otherTop, otherBottom)) &&
                    (this.between(thisLeft, otherLeft, otherRight) || this.between(thisRight,otherLeft, otherRight)))
                )
    }
}

function spawnEnemy(){

        setInterval(() => {
            if (enemies.length  < 4) {

                const radius = 23
                let x 
                let y 
        
                if (Math.random < 0.5){
                    x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
                    y = Math.random() * canvas.height
                }
                else {
                    x = Math.random() * canvas.width
                    y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
                }
                
                const angle = Math.atan2(player.centerY - y, player.centerX - x)

                //let strength = (Math.floor(Math.random() * 4)) + 1 // 1-3
                let strength 
                let speed 
                let imgToUse
        
                let enemyType = (Math.floor(Math.random() * 3)) + 1;

                switch(enemyType){
                    case 1: 
                        enemy = enemy1;
                        strength = 1;
                        speed = 1.5
                    break;
                    case 2:
                         enemy = enemy2;
                         strength = 1
                         speed = 1.5
                    break;
                    case 3: 
                        enemy = enemy3;
                        strength = 1
                        speed = 1.5
                    break;
                }
                    
                const velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed 
                }
            
                enemies.push(new Enemy(x, y, velocity, strength, enemy))
            }
    
        }, 1000);
}

function spawnGoodie(){

    setInterval(() => {
        if (goodies.length  < 2) {

            const radius = 23
            let x 
            let y 
    
            if (Math.random < 0.5){
                x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
                y = Math.random() * canvas.height
            }
            else {
                x = Math.random() * canvas.width
                y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
            }

            const angle = Math.atan2(player.centerY - y, player.centerX - x)

            let speed 
            let imgToUse
    
            let goodieType = (Math.floor(Math.random() * 3)) + 1;

            switch(goodieType){
                case 1: 
                    goodie = goodie1;
                    speed = 1
                break;
                case 2:
                    goodie = goodie2;
                    speed = 1
                break;
                case 3: 
                    goodie = goodie3;
                    speed = 1
                break;
            }
                
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed 
            }
            goodies.push(new Goodie(x, y, velocity, goodie))
        }

    }, 5000);
}

const projectiles = []
const enemies = []
const goodies = []
const particles = []

let animationId
let score = 0


function animate() {
    animationId = requestAnimationFrame(animate)

    c.drawImage(imgBackground,0,0,canvas.width,canvas.height)

    // c.fillStyle = 'rgb(0, 0, 0)'
    // c.fillRect(0, 0, canvas.width, canvas.height)

    
    player.update()

    particles.forEach((particle, particleIndex) => {
        
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        } else {
            particle.update()
        }        
    })

    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();

        if (projectile.outOfPlay) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0);            
        }

        // if (projectile.x - projectile.radius < 0  || 
        //     projectiles.x + projectiles.radius > canvas.width || 
        //     projectile.y - projectile.radius < 0  || 
        //     projectiles.y + projectiles.radius > canvas.height ) {
        // }
    })

    animateEnemies()
    animateGoodies()

    if(score>= 3)
            {
                endGame(true)
            }
}

function animateEnemies() {

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Enemy moved out of Play Area
        if (enemy.outOfPlay)
        setTimeout(() => {
            enemies.splice(enemyIndex, 1)
        }, 0);

        // End Game
        if (enemy.detectCollision(player.centerX, player.centerY, player.width, player.height)  ) {
                explosionSound  = new sound(playerExplosionSound)
                explosionSound.volume = 0.2
                explosionSound.play()
                createExplosion(player.centerX, player.centerY,'red', 50)  
                player.startShrink(5)
           }

        // Enemy Hit
        projectiles.forEach((projectile, projectileIndex) => {

            if (enemy.detectCollision(projectile.x, projectile.y, projectile.radius, projectile.radius)) {
                enemy.strength--
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1)
                }, 0);

                if(enemy.strength <= 0) {
                    enemy.startShrink()
                    var explosionSound = new sound(enemyExplosionSound)
                    explosionSound.volume = 0.2
                    explosionSound.play()
                    createExplosion(projectile.x, projectile.y,'white', 10)
        
                    if (enemy.width <= 0 && enemy.height <= 0) {
                        setTimeout(() => {
                            enemies.splice(enemyIndex, 1)
                            projectiles.splice(projectileIndex, 1)
                        }, 0);
                    }
                }
            }
        })
    });
}

function animateGoodies() {

    goodies.forEach((goodie, goodieIndex) => {
        goodie.update();

        // Goodie moved out of Play Area
        if (goodie.outOfPlay)
        setTimeout(() => {
            goodies.splice(goodieIndex, 1)
        }, 0);

        // Goodie in Basket
        if (goodie.detectCollision(player.centerX, player.centerY, player.width, player.height))
        {
            var addToTrolleySound = new sound(addToBasketSound)
            addToBasketSound.volume = 0.2
            addToTrolleySound.play()
                        
            goodie.startShrink()
            if (goodie.width <= 0 && goodie.height <= 0) {
                setTimeout(() => {
                    goodies.splice(goodieIndex, 1)                    
                }, 0);                
            }
                       
            
        }
    });
}

function createExplosion (x, y, color, particleCount){
    // Create Explosions
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            x, 
            y, 
            Math.random() * 4, 
            color, 
        {
            x: (Math.random() - 0.5) * (Math.random() * 8), 
            y: (Math.random() - 0.5) * (Math.random() * 8)
        } ))
    }    
}

let inPlay = false

addEventListener('click', (event) => {

    // Make sure the game start click does not fire off a shot
    if (!inPlay) {
        inPlay = true
        return
    }
    
    const angle = Math.atan2(event.clientY - player.centerY, event.clientX - player.centerX)

    const velocity = {
        x: (Math.cos(angle) * 5) ,
        y: (Math.sin(angle) * 5)
    }

    // Take into account the players speed, and increate the speed of the projectile
    velocity.x = (Math.abs(velocity.x) + Math.abs(player.velocity.x)) * (velocity.x < 0 ? -1 : 1)
    velocity.y = (Math.abs(velocity.y) + Math.abs(player.velocity.y)) * (velocity.y < 0 ? -1 : 1)


    var fireSound = new sound(playerFireSound)
    fireSound.play()

    projectiles.push(new Projectile(
        player.centerX, 
        player.centerY, 
        5, 
        'red', 
        velocity))
})

startGameBtn.addEventListener('click', () => {
    startGame();
})
restartGameBtn.addEventListener('click', () => {
    startGame();
})

    // Main Start
    const player = new Player(0, 0, {x:1, y:0}, playerSettings)
    c.drawImage(imgBackground,0,0,canvas.width,canvas.height)
    startGameModal.style.display = 'flex'

function startGame(){
    console.log('startGame')
    projectiles.length = 0;
    enemies.length = 0;
    goodies.length = 0;
    particles.length = 0;
    score = 0
    scoreElement.innerHTML = score    
    
    player.init(0, 0, {x:1, y:0}, playerSettings)

    music = new sound("./music.mp3", true);  
    music.volume = 0.2  
    music.play();  
    animate();
    spawnEnemy();
    spawnGoodie();
    startGameModal.style.display = 'none';
    endGameModal.style.display = 'none';
    
    player.update()
}

function endGame(success){
    console.log('endGame')
    cancelAnimationFrame(animationId)    
    endGameModal.style.display = 'flex'
    finalScore.innerHTML = score + ' items collected.'
    if(success)
    {
      messageText.innerHTML = "CONGRATULATIONS! You have earned a 10% discount for your next purchase! Promo code: BEATUIFULCODE"
      document.getElementById("winPanel").style.display = 'flex'
    }
    else
    {
      messageText.innerHTML = "Sorry, you did not win this time!"
      document.getElementById("winPanel").style.display = 'none'
    }
}

addEventListener('keydown', (e) => {
    if (e.keyCode && e.keyCode == 37) {player.setVelocity(-1, 0) }
    if (e.keyCode && e.keyCode == 39) {player.setVelocity(1, 0) }
    if (e.keyCode && e.keyCode == 38) {player.setVelocity(0, -1) }
    if (e.keyCode && e.keyCode == 40) {player.setVelocity(0, 1) }
})




function sound(src, loop = false) {
    this.sound = document.createElement("audio");
    this.sound.volume = 0.1
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    if (loop)
        this.sound.setAttribute("loop","true")
    

    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

