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

const imgEnemy1 = new Image(10,10)
imgEnemy1.src = 'BrandX-1.png'

const imgEnemy2 = new Image()
imgEnemy2.src = 'BrandX-2.png'

const imgEnemy3 = new Image()
imgEnemy3.src = 'BrandX-3.png'

const imgTrolleyLeft = new Image(50,50)
imgTrolleyLeft.src = 'Basket3.png'

const imgTrolleyRight = new Image(50,50)
imgTrolleyRight.src = 'Basket3.png'

const imgGoodie1 = new Image(10,10)
imgGoodie1.src = 'tarte01.png'

const imgGoodie3 = new Image(10,10)
imgGoodie3.src = 'tarte02.png'

const imgGoodie4 = new Image(10,10)
imgGoodie4.src = 'tarte03.png'

const imgGoodie5 = new Image(10,10)
imgGoodie5.src = 'tarte04.png'

const imgGoodie6 = new Image(10,10)
imgGoodie6.src = 'tarte05.png'

const imgGoodie7 = new Image(10,10)
imgGoodie7.src = 'Esw.png'


canvas.width = innerWidth
canvas.height = innerHeight

let music;

endGameModal.style.display = 'none';

// class Player {
//     constructor(x, y, radius, color) {
//         this.x = x
//         this.y = y
//         this.radius = radius
//         this.color = color
//     }

//     // draw() {
//     //     c.beginPath()
//     //     c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
//     //     c.fillStyle = this.color
//     //     c.fill();
//     // }
// }

class Player {
    constructor(centerX, centerY, velocity, size) {
        this.centerX = centerX
        this.centerY = centerY
        this.size = size
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)
        this.shrinkFactor = 0
        this.velocity = velocity
    }

    init()
    {
        this.centerX = canvas.width / 2
        this.centerY = canvas.height / 2
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)
        this.velocity = {x:1, y:0}
        this.shrinkFactor = 0
        this.size = 100
    }

    draw() {
        if (this.size > 0 && this.shrinkFactor > 0) {
            this.size -= this.shrinkFactor
            this.topLeftX = this.centerX - (this.size / 2)
            this.topLeftY = this.centerY - (this.size / 2)
        }

        if (this.size <= 0) {
            endGame(false)                
        }

        c.drawImage(this.velocity.x >= 0 ? imgTrolleyRight : imgTrolleyLeft, this.topLeftX, this.topLeftY, this.size, this.size);  
            
    }

    startShrink(shrinkFactor = 2)     {
        this.shrinkFactor = shrinkFactor;
    }

    detectCollision(x, y) {
        return x >= this.topLeftX && x <= this.topLeftX + this.size &&
               y >= this.topLeftY && y <= this.topLeftY + this.size 
    }

    update() {

        console.log(this.velocity.x)
        console.log(this.velocity.y)

        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y

        if (this.centerX - (this.size / 2) <= 0) { 
            this.centerX = this.size / 2
            this.velocity.x = 0
        }

        if (this.centerY - (this.size / 2) <= 0) {
            this.centerY = this.size / 2
            this.velocity.y = 0
        }

        if (this.centerX + (this.size / 2) >= canvas.width) {
            this.centerX = canvas.width - (this.size / 2)
            this.velocity.x = 0
        }

        if (this.centerY + (this.size / 2) >= canvas.height) {
            this.centerY = canvas.height - (this.size / 2)
            this.velocity.y = 0
        }

        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)        
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
    constructor(centerX, centerY,  velocity, strength, img) {
        this.centerX = centerX
        this.centerY = centerY
        this.velocity = velocity
        this.strength = strength
        this.img = img
        this.size = 46
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)
        this.hasBeenVisible = false
        this.canBeDeleted = false        
    }

    draw() {
            c.drawImage(this.img, this.topLeftX, this.topLeftY, this.size, this.size);  
            c.font = "15pt Calibri";
            if (this.strength > 1)
                c.fillText(this.strength, this.centerX, this.topLeftY);
    }

    detectCollision(x, y) {
        return x >= this.topLeftX && x <= this.topLeftX + this.size &&
               y >= this.topLeftY && y <= this.topLeftY + this.size 

    }

    between(n,x,y) {return n >= x && n <= y;}

    detectCollision(x, y, size) {
        let otherTop = y - (size / 2)
        let otherBottom = y + (size / 2)
        let otherLeft = x - (size / 2)
        let otherRight = x + (size / 2)
        
        let thisTop = this.topLeftY
        let thisBottom = this.topLeftY + this.size
        let thisLeft = this.topLeftX
        let thisRight = this.topLeftX + this.size

        return  ((this.between(otherTop, thisTop, thisBottom) || this.between(otherBottom,thisTop, thisBottom)) &&
                (this.between(otherLeft, thisLeft, thisRight) || this.between(otherRight,thisLeft, thisRight))) ||
                (
                    ((this.between(thisTop, otherTop, otherBottom) || this.between(thisBottom,otherTop, otherBottom)) &&
                    (this.between(thisLeft, otherLeft, otherRight) || this.between(thisRight,otherLeft, otherRight)))
                )

    }

    update() {
        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)
        
        // Check that item has appeared in the play area
        if (this.topLeftX > 0 || 
            this.topLeftY > 0 || 
            this.topLeftX + this.size < canvas.width || 
            this.topLeftY + this.size < canvas.height) {
                this.hasBeenVisible = true
            }

        // If it has appeared in the play area, and now out of bounds - delete it.    
        if (this.topLeftX + this.size < 0 || 
            this.topLeftY + this.size < 0 ||
            this.topLeftX > canvas.width || 
            this.topLeftY > canvas.height) {
                if (this.hasBeenVisible) this.canBeDeleted = true;
            }
    }
}

class Goodie {
    constructor(centerX, centerY, velocity, img) {
        this.centerX = centerX
        this.centerY = centerY
        this.size = 46
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)        
        this.velocity = velocity
        this.img = img
        this.shrink = 0
    }

    draw() {
            c.drawImage(this.img, this.centerX, this.centerY, this.size, this.size);  
    }

    startShrink(shrinkFactor = 2)     {
        this.shrink = shrinkFactor;
    }

    update() {        
        this.draw()
        this.centerX += this.velocity.x
        this.centerY += this.velocity.y
        this.topLeftX = this.centerX - (this.size / 2)
        this.topLeftY = this.centerY - (this.size / 2)        

        if (this.size > 0 && this.shrink > 0) {
            this.size -= this.shrink
        }        
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
                        imgToUse = imgEnemy1;
                        strength = 1;
                        speed = 1
                    break;
                    case 2:
                         imgToUse = imgEnemy2;
                         strength = (Math.floor(Math.random() * 4)) + 1 // 1-3
                         speed = 1
                    break;
                    case 3: 
                        imgToUse = imgEnemy3;
                        strength = 1
                        speed = 2.5
                    break;
                }
                    
                const velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed 
                }
            
                enemies.push(new Enemy(x, y, velocity, strength, imgToUse))
            }
    
        }, 1000);
}

function spawnGoodie(){

    setInterval(() => {
        if (goodies.length  < 6) {

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
    
            let goodieType = (Math.floor(Math.random() * 6)) + 1;

            switch(goodieType){
                case 1: 
                    imgToUse = imgGoodie1;
                    speed = 1
                break;
                case 2:
                     imgToUse = imgGoodie3;
                     speed = 1
                break;
                case 3: 
                    imgToUse = imgGoodie4;
                    speed = 1
                break;
                case 4: 
                    imgToUse = imgGoodie5;
                    speed = 1
                break;
                case 5: 
                    imgToUse = imgGoodie6;
                    speed = 1
                break;
                case 6: 
                    imgToUse = imgGoodie7;
                    speed = 1
                break;

            }
                
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed 
            }
        
            var goodieSound = new sound("./Goodie.mp3")
            goodieSound.play()
            goodies.push(new Goodie(x, y, velocity, imgToUse))

        }

    }, 1000);
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

        if (projectile.x - projectile.radius < 0  || 
            projectiles.x + projectiles.radius > canvas.width || 
            projectile.y - projectile.radius < 0  || 
            projectiles.y + projectiles.radius > canvas.height ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0);            
        }
    })

    animateEnemies()
    animateGoodies()
}

function animateEnemies() {

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // Enemy moved out of Play Area
        if (enemy.canBeDeleted)
        setTimeout(() => {
            enemies.splice(enemyIndex, 1)
        }, 0);

        // End Game
        if (enemy.detectCollision(player.centerX, player.centerY, player.size)  ) {

           
                explosionSound  = new sound("./Explosion2.mp3")
                explosionSound.play()
                createExplosion(player.centerX, player.centerY,'red', 50)  
                player.startShrink(5)
           
           

        }

        // Enemy Hit
        projectiles.forEach((projectile, projectileIndex) => {

            if (enemy.detectCollision(projectile.x, projectile.y, projectile.radius)) {
                enemy.strength--
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1)
                }, 0);

                if(enemy.strength <= 0) {
                    var explosionSound = new sound("./Explosion1.mp3")
                    explosionSound.play()
                    createExplosion(projectile.x, projectile.y,'white', 10)
        
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0);
                }
            }
        })
    });
}

function animateGoodies() {

    goodies.forEach((goodie, goodieIndex) => {
        goodie.update();

        const dist = Math.hypot(player.centerX - goodie.centerX, player.centerY - goodie.centerY)

        // Goodie in Trolley
        if (player.detectCollision(goodie.centerX, goodie.centerY))
        {
            var addToTrolleySound = new sound("./AddToTrolley.mp3")
            addToTrolleySound.play()
            goodie.startShrink()
            if (goodie.size <= 0) {
                setTimeout(() => {
                    goodies.splice(goodieIndex, 1)
                    score += 1   
                    scoreElement.innerHTML = score
                }, 0);
            }
            if(score>= 5)
            {
                endGame(true)
            }
        }

        // Goodie Hit - Game Over
        // projectiles.forEach((projectile, projectileIndex) => {
        //     const dist = Math.hypot(projectile.x - goodie.x, projectile.y - goodie.y)
        //     if (dist - goodie.radius - projectile.radius < 1) {                
        //         setTimeout(() => {
        //             projectiles.splice(projectileIndex, 1)
        //         }, 0);

        //         createExplosion(projectile.x, projectile.y, 'green', 10)
        //         if (!endGame) {
        //             createExplosion(player.x, player.y,'red', 50)  
        //             skrink = 5          
        //             endGameModal.style.display = 'flex'
        //             finalScore.innerHTML = score
        //         }
    
        //         endGame = true

        //         setTimeout(() => {
        //             goodies.splice(goodieIndex, 1)
        //             projectiles.splice(projectileIndex, 1)
        //         }, 0);
        //     }
        // })
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


addEventListener('click', (event) => {

    if (endGame) return

    const angle = Math.atan2(event.clientY - player.centerY, event.clientX - player.centerX)

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    var fireSound = new sound("./Fire2.mp3")
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
    player = new Player(0, 0, {x:1, y:0}, 100)
    player.update()
    c.drawImage(imgBackground,0,0)

function startGame(){
    projectiles.length = 0;
    enemies.length = 0;
    goodies.length = 0;
    particles.length = 0;
    score = 0
    
    player.init()

    music = new sound("./music.mp3", true);    
    music.play();  
    animate();
    spawnEnemy();
    spawnGoodie();
    startGameModal.style.display = 'none';
    endGameModal.style.display = 'none';

    
    player.update()
   
    c.drawImage(imgBackground,0,0)
}

function endGame(success){
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

