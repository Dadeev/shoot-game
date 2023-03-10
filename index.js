const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElem = document.querySelector('#scoreElem')
const startBtn = document.querySelector('#startBtn')
const modelElem = document.querySelector('#modelElem')
const bigScoreElem = document.querySelector('#bigScoreElem')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
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
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.99

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, '#e5e2e2')
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, '#e5e2e2')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreElem.innerHTML = score
    bigScoreElem.innerHTML = score
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    particles.forEach((particle, partIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(partIndex, 1)
        } else {
            particle.update()
        }
    })

    projectiles.forEach((projectile, projIndex) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.width
        ) {
            setTimeout(() => {
                projectiles.splice(projIndex, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()

        const enemyAndPlayerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (enemyAndPlayerDist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId)
            modelElem.style.display = 'flex'
            bigScoreElem.innerHTML = score
        }

        projectiles.forEach((projectile, projIndex) => {
            const projectileAndEnemyDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (projectileAndEnemyDist - projectile.radius - enemy.radius < 1) {
                for (let i = 0; i < enemy.radius; i++) {
                    particles.push(
                        new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6)
                        })
                    )
                }

                if (enemy.radius - 10 > 5) {
                    score += 100
                    scoreElem.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projIndex, 1)
                    }, 0)
                } else {
                    score += 250
                    scoreElem.innerHTML = score

                    setTimeout(() => {
                        projectiles.splice(projIndex, 1)
                        enemies.splice(enemyIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

addEventListener('click', (e) => {
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, '#e5e2e2', velocity)
    )
})

startBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modelElem.style.display = 'none'
})
