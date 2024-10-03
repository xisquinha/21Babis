var config = {
  type: Phaser.AUTO,
  
  scale: {
      parent: 'game',
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
  },
  
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 900 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var doubleJump = 0;
var click = false;

// função da Scene
function preload ()
{
    // fazer load de todas as imagens que vamos usar
    this.load.image('sky', 'images/background.png');
    this.load.image('ground', 'images/platform.png');
    this.load.image('star', 'images/star.png');
    this.load.image('bomb', 'images/bomb.png');
    // a personagem é um sprite porque contém frames de animação, a sprite da personagem tem 9 imagens 
    this.load.spritesheet('dude', 'images/dude.png', { frameWidth: 32, frameHeight: 48 });

    this.load.atlas('tiles', 'images/platform_tiles.png','atlas.json');
}

function create ()
{
    // por default as imagens são posicionadas pelo seu centro
    var bg = this.add.image(0, 0, 'sky').setOrigin(0, 0);


    // PLATFORMS
    // o grupo de objetos estáticos "plataforma" foi criado
    platforms = this.physics.add.staticGroup();

    // como já temos o grupo "plataformas" podemos começar a criar os objetos plataforma
    /*platforms.create(400, 568, 'ground').setScale(2).refreshBody(); // como demos scale num static body temos de fazer .refreshBody()
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');*/

    platforms.create(48, 552, 'tiles', 'plataforma_inicio');
    platforms.create(91, 552, 'tiles', 'plataforma_miolo');
    platforms.create(155, 552, 'tiles', 'plataforma_miolo');
    platforms.create(219, 552, 'tiles', 'plataforma_miolo');
    platforms.create(256, 552, 'tiles', 'plataforma_fim');
  

    // teste
    //platforms.create(100, 100, 'someTiles', 'chave_prata');

    let leftBoundary = platforms.create(-16, 300, 'ground').setScale(0.08, 25).refreshBody();
    
    // para ler as setas do teclado
    cursors = this.input.keyboard.createCursorKeys();
    
    // ------------------------------- PLAYER -------------------------------------

    // como fizemos this.physics.add significa que é por default um dynamic body
    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.15);
    //player.setCollideWorldBounds(true);

    // animação de correr para a esquerda
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1  // repeat -1 é para a animação dar loop
    });

    // animação de trocar de direção
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    // animação de correr para a direita
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    

    // para haver um collider entre o player e todas as plataformas
    this.physics.add.collider(player, platforms);


    // --------------------------- STARS ----------------------------------------
    // por default é um grupo dinamic
    /*stars = this.physics.add.group({
        key: 'star', // dizemos que vai ser a imagem 'star'
        repeat: 11, // repetimos a criação de estrelas 11x, logo irá ter 12 estrelas
        setXY: {x:12, y:0, stepX: 70} // definimos a posição das 12 estrelas
        // o stepX: 70 significa que as estrelas irão estar distanciadas 70 pixels no eixo xx,
        // a primeira vai ter coordenadas (12, 0), a segunda (82, 0), a terceira (152, 0), etc
    });

    // passamos por todas as estrelas e atribuimos um valor de bounce entre 0.4 e 0.8
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); 
    });

    this.physics.add.collider(stars, platforms);
    // para ver se o player toca ou não numa estrela
    this.physics.add.overlap(player, stars, collectStar, null, this);*/


    
    // ------------------------------ BOMBAS --------------------------------------
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
    
    this.physics.add.collider(player, bombs, hitBomb, null, this);



    // ------------------------------ SCORE --------------------------------------
    // coord, texto, tam letra, cor
    scoreText = this.add.text(16, 16, 'score: ' + score, { fontSize: '32px', fill: '#000' });

    scoreText.setScrollFactor(0); // para o score se mexer com a câmera

    // ----------------------------- CAMERA ----------------------------------------
    this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight); // os limites da camera
    this.cameras.main.startFollow(player); // para a camera seguir o player
}

function update ()
{
    // se clicarmos na seta da esquerda
    if (cursors.left.isDown){
        
        player.setVelocityX(-160); // damos uma velocidade ao player
        player.anims.play('left', true); // e corremos uma certa animação
        
    }else if (cursors.right.isDown){
        
        player.setVelocityX(160);    
        player.anims.play('right', true);
        
    }else{
        
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if(cursors.up.isUp && doubleJump == 1){
        click = true;
    }
  
    // se clicarmos na seta de saltar
    if (cursors.up.isDown){
      
        // e ainda não tivermos saltado, saltamos
        if(doubleJump == 0){
            doubleJump += 1;
            click = false;
            player.setVelocityY(-330);
          
        // se já tivermos saltado uma vez damos double jump 
        }else if(doubleJump == 1 && click){
            doubleJump += 1;
            let vel = player.body.velocity.y;
            player.setVelocityY(-vel-290);
            click = false;
        }
    }

    // se já tivermos no chão pomos a variável do double jump a zero
    if(player.body.touching.down && doubleJump != 0 ){
        doubleJump = 0;
        click = false;
    }
}

// função que corre quando o player se sobrepõe a uma estrela
function collectStar (player, star)
{
    star.disableBody(true, true);

    // quando o player apanha uma estrela, ganah mais 10 pontos
    score += 10;
    scoreText.setText('score: ' + score);

    // se o player apanhar todas as estrlas, lançamos uma bomba
    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });


        // Criar uma bomba
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

// se uma bomba tocar no player
function hitBomb(player, bomb){

    this.physics.pause(); // o jogo pausa
    player.setTint(0xff0000); // o player fica vermelho
    player.anims.play('turn'); // o player fica virado para a frente
    gameOver = true;
}    
