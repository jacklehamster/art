require([
    'threejs',
    'dobuki',
], function(THREE, DOK) {
    window.DOK = DOK;

    var debug = {
        fps: location.search.indexOf("fps")>=0,
    };

    document.getElementById("fps").style.display = debug.fps ? "" : "none";

    var engine = new DOK.Engine({
        canvas: document.getElementById('abc'),
    });

    var images = {
        poop:[
            require.toUrl('poop.png'),
            require.toUrl('poop.png|scale:-1,1'),
        ],
        squid: {
            normal:[
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,0,32,32"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,0,32,32"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,32,32,32"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,32,32,32"),
            ],
            shadow:[
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,0,32,32|shadow"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,0,32,32|shadow"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|0,32,32,32|shadow"),
                require.toUrl("https://jacklehamster.github.io/dok/images/squid.png|32,32,32,32|shadow"),
            ],
        },
        run: require.toUrl('run.gif'),
        floor: require.toUrl("https://jacklehamster.github.io/dok/images/wood.png"),
//        lava: require.toUrl('http://localhost/~vincent/game/world/lava.png'),
        sand: [
            require.toUrl('walk.jpg'),
            require.toUrl('walk.jpg|scale:-1,1'),
            require.toUrl('walk.jpg|scale:1,-1'),
            require.toUrl('walk.jpg|scale:-1,-1'),
        ],
        dirt: [
            require.toUrl('walkshit.jpg'),
            require.toUrl('walkshit.jpg|scale:-1,1'),
            require.toUrl('walkshit.jpg|scale:1,-1'),
            require.toUrl('walkshit.jpg|scale:-1,-1'),
        ],
/*        water: [
            require.toUrl("http://localhost/~vincent/game/world/water.jpg"),
            require.toUrl("http://localhost/~vincent/game/world/water.jpg|scale:-1,1"),
            require.toUrl("http://localhost/~vincent/game/world/water.jpg|scale:1,-1"),
            require.toUrl("http://localhost/~vincent/game/world/water.jpg|scale:-1,-1"),
        ],*/
        sprite: [
        ],
        border: [
        ],
        hand: {
            left: require.toUrl('shitterleft.gif'),
            right: require.toUrl('shitter.gif'),
//            down: require.toUrl('shitter.gif'),
//            up: require.toUrl('shitter.gif'),
//            down: require.toUrl('hand.png'),
//            left: require.toUrl('hand-right.png|scale:-1,1'),
//            right: require.toUrl('hand-right.png'),
//            up: require.toUrl('hand-far.png'),
        },
        coin: require.toUrl('coin.png'),
    };
    DOK.SpriteSheet.preLoad(images);

    function getBorderedImage(index) {
        if(index in DOK.SpriteSheet.spritesheet.border) {
            return DOK.SpriteSheet.spritesheet.border[index];
        }
        var cut = DOK.SpriteSheet.getCut(index);
        images.border[index] = cut.url + "|border:10%";
        DOK.SpriteSheet.preLoad(images);
        return DOK.SpriteSheet.spritesheet.border[index];
    }


    var spriteRenderer = new DOK.SpriteRenderer();
    engine.scene.add(spriteRenderer.mesh);
    window.spriteRenderer = spriteRenderer;
    spriteRenderer.curvature = .5;
//    spriteRenderer.bigwave = 15;



    //    var mouse = {x:0,y:0};
    /*    document.addEventListener("mousemove", function(e) {
     mouse.x = e.pageX - innerWidth/2;
     mouse.y = e.pageY - innerHeight/2;
     e.preventDefault();
     });
     */

    var range = 50;
    var cellSize = 256;
    engine.renderer.setClearColor (0x87CEEB, 1);




    var roundabout = new DOK.Utils.Roundabout();
    var closestPoint = { x:0,y:0};
    function getClosestSpritePosition(x,y,limit) {
        x = Math.round(x);
        y = Math.round(y);
        roundabout.reset();
        //        console.log(x,y);

        for(var i=0; i<limit; i++) {
            var pos = roundabout.next();
            var sprites = spriteCollection.get(x+pos[0],y+pos[1]);
            if(sprites && !empty(sprites)) {
                closestPoint.x = x+pos[0];
                closestPoint.y = y+pos[1];
                return closestPoint;
            }
        }
        return null;
    }

    function empty(obj) {
        for(var i in obj) {
            return false;
        }
        return true;
    }

    function picked(obj) {
        return obj.uid === pickedItem;
    }


    var mouseControl = false;
    var selectedObj = { x: 0, y: 0};
    function getSelected() {
        if(!mouseControl) {
            return null;
        }
        //        var xPos = camera.position.x + mouse.x * 2;
        //        var yPos = camera.position.y - 2 * mouse.y;

        var xPos = mousePos.x;
        var yPos = mousePos.y;
        if(selectedObj.x !== Math.round(xPos/cellSize) || selectedObj.y !== Math.round(yPos/cellSize)) {
            selectedObj.x = Math.round(xPos/cellSize);
            selectedObj.y = Math.round(yPos/cellSize);// + 6;
        }
        return selectedObj;
    }

    function getCamPos() {
        var xPos = camera.position.x;
        var yPos = camera.position.y;

        selectedObj.x = Math.round(xPos/cellSize);
        selectedObj.y = Math.round(yPos/cellSize) + 6;
        return selectedObj;
    }

    var collection = new DOK.Collection(
        {
            type: "grid",
            get x() {
                return getCamPos().x -Math.floor(range/2);
            },
            get y() {
                return getCamPos().y -Math.floor(range/2);
            },
            width: range,
            height: range,
        },
        function(x,y) {
            var frame = Math.floor(DOK.Loop.time/100);
            var sel = getSelected();
            var selected = sel && !spritePos && pickedItem===null && sel.x === x && sel.y === y;
            var light = .5;
            //var mapindex = x + y*10000;
            var anim = DOK.SpriteSheet.spritesheet.sand;
  //          if(shitMap[mapindex%shitMap.length]) {
//                anim = DOK.SpriteSheet.spritesheet.dirt;
    //        }

            var img = anim[Math.abs(x*13^y*7)%4];
            if(selected && Math.floor(DOK.Loop.time/10)%4!==0) {
                img = getBorderedImage(img);
            }

            return DOK.SpriteObject.create(
                x*cellSize,y*cellSize,0,//c!==0?0:-64,
                cellSize,cellSize,
                DOK.Camera.quaternions.southQuaternionArray,
                img,
                light*1.5,//c!==0?1:1.5,
                0,//15,
            );
        }
    );

    function spriteSelection() {
        var sel = spritePos;
        return sel ? spriteCollection.get(sel.x,sel.y) : null;
    }

    var spriteCubes = [];
    function spriteCube(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = this.options.cellSize*3;
        var pickedMe = picked(spriteInfo);
        var light = pickedMe ? Math.random() : 1;
        //spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y ? Math.random() : 1;
        var selected = spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y;
        var img = DOK.SpriteSheet.spritesheet.sprite[index];
        if(!pickedMe && selected && Math.floor(DOK.Loop.time/10)%4!==0) {
            img = getBorderedImage(img);
        }

        spriteCubes.push(DOK.SpriteObject.create(
            x*cellSize,y*cellSize,size/2,
            size,size,
            DOK.Camera.quaternions.southQuaternionArray,
            img,
            light,
            15,
        ));
        spriteCubes.push(DOK.SpriteObject.create(
            x*cellSize-10,y*cellSize,size/2,
            size,size,
            DOK.Camera.quaternions.westQuaternionArray,
            img,
            light,
            15,
        ));
        spriteCubes.push(DOK.SpriteObject.create(
            x*cellSize+10,y*cellSize,size/2,
            size,size,
            DOK.Camera.quaternions.eastQuaternionArray,
            img,
            light,
            15,
        ));
        spriteCubes.push(DOK.SpriteObject.create(
            x*cellSize,y*cellSize,size/2,
            size,size,
            DOK.Camera.quaternions.eastQuaternionArray,
            img,
            light,
            15,
        ));
        spriteCubes.forEach(setTypeCube)
        return spriteCubes;
    }

    function setTypeCube(spriteObj) {
        spriteObj.type = 'face';
    }

    function spriteFace(spriteInfo) {
        var x = spriteInfo.x;
        var y = spriteInfo.y;
        var index = spriteInfo.index;
        var size = this.options.cellSize*3;
        var pickedMe = picked(spriteInfo);
        var light = pickedMe ? Math.random() : 1;
        //spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y ? Math.random() : 1;
        var selected = spritePos && Math.floor(x)===spritePos.x&& Math.floor(y)===spritePos.y;
        var img = DOK.SpriteSheet.spritesheet.sprite[index];
        if(!pickedMe && selected && Math.floor(DOK.Loop.time/10)%4!==0) {
            img = getBorderedImage(img);
        }

        var spriteObj = DOK.SpriteObject.create(
            x*cellSize,y*cellSize,size/2,
            size,size,
            null,
            img,
            light,
            15,
        );
        spriteObj.type = "face";
        return spriteObj;
    }


    var spriteCollection = DOK.Collection.createSpriteCollection({
        cellSize: cellSize,
        spriteFunction: function(spriteInfo) {
            switch (spriteInfo.type) {
                case 'face':
                    return spriteFace.call(this,spriteInfo);
                    break;
                case 'cube':
                    return spriteCube.call(this,spriteInfo);
                    break;
            }
        },
    });
    window.ss = spriteCollection;

    var camera = DOK.Camera.getCamera();
    //    var mz = 0, rot = 0;
    var camGoal = {
        x:camera.position.x, y:camera.position.y,
    };

    var mousePos = new THREE.Vector3();
    /*    document.addEventListener("mousemove", function(event) {
     mouseMoveTo(event.pageX, event.pageY);
     event.preventDefault();
     });
     */
    var pickedItem = null;
    /*    document.addEventListener("mousedown", function(event) {
     for(var uid in spriteSelection()) {
     pickedItem = uid;
     }
     });

     document.addEventListener("mouseup", function(event) {
     pickedItem = null;
     });
     */

    /*
     var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
     var material = new THREE.MeshNormalMaterial();
     var egg = new THREE.Mesh(geometry, material);
     egg.position.set(0,0,0);
     egg.geometry.scale(8,10,8);
     scene.add(egg);
     */

/*    var request = new XMLHttpRequest();
    request.open("GET", "config.json", true);
    request.addEventListener("load", function() {
        var config= JSON.parse(request.responseText);
        DOK.Camera.setCameraPosition(config.camera);
    });
    request.send(null);
*/

    function createSprite(index) {
        if(!getSelected()) {
            return;
        }
        var x = getSelected().x; //getCamPos().x,
        var y = getSelected().y; //getCamPos().y,
        var spriteInfo = spriteCollection.create(x,y,index);
        spriteInfo.type = 'face';
        //        console.log("DROPPED",spriteInfo);

        /*        var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
         var material = new THREE.MeshNormalMaterial();
         var egg = new THREE.Mesh(geometry, material);
         egg.position.set(getSelected().x*64,getSelected().y*64,0);
         egg.geometry.scale(8,8,8);
         scene.add(egg);*/
        /*
         var geometry = new THREE.PlaneGeometry(1,1);
         var material = new THREE.MeshNormalMaterial();
         var egg = new THREE.Mesh(geometry, material);
         egg.position.set(getSelected().x*64,getSelected().y*64,0);
         egg.geometry.scale(8,8,8);
         egg.rotateX(Math.PI);
         scene.add(egg);
         */
        /*
         return DOK.create(DOK.SpriteObject).init(
         x*cellSize,y*cellSize,size/2,
         size,size,
         null,
         1,
         DOK.spritesheet.sprite[index]
         );
         */
    }

    function cancel(e) {
        e = e || event;
        //console.log(e.dataTransfer);
        //        mouse.x = e.pageX - innerWidth/2;
        //        mouse.y = e.pageY - innerHeight/2;
        mouseMoveTo(e.pageX, e.pageY);
        e.preventDefault();
        return false;
    }

    function drop(e) {
        e = e || event;
        var dt    = e.dataTransfer;
        var reader = new FileReader();
        var file = dt.files[0];
        //        console.log(e);
        reader.addEventListener( 'loadend', function(e) {
            console.log(file.type);
            if(['image/gif','image/jpeg','image/png'].indexOf(file.type)<0) {
                return;
            } else if(file.size>10000000) {
                return;
            }
            var img = new Image();
            img.addEventListener("load", function(e) {
                console.log(img);
                //        images['floor'] = img.src;
                const index = images.sprite.length;
                images.sprite.push(img.src);
                DOK.SpriteSheet.preLoad(images);

                createSprite(index);


                /*            document.getElementById("sidebar").appendChild(img);
                 img.style.cursor = "pointer";
                 img.addEventListener("click", function(e) {
                 createSprite(index);

                 });*/
                //    img.addEventListener("click", function(e) {
                //
                //  });
                //        DOK.preLoad(images);
                /*        hero[5] = mx - img.naturalWidth/2;
                 hero[6] = my - img.naturalHeight/2;
                 hero[7] = img.naturalWidth;
                 hero[8] = img.naturalHeight;*/
            });

            img.src = this.result;
            reader = null;
        });

        reader.readAsDataURL(file);
        e.preventDefault();
        return false;
    }
    document.addEventListener('dragover', cancel);
    document.addEventListener('dragenter', cancel);
    document.addEventListener('dragleave', cancel);
    document.addEventListener('drop', drop);


    /*
     var geometry = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
     var material = new THREE.MeshNormalMaterial();
     var egg = new THREE.Mesh(geometry, material);
     egg.position.set(0,0,0);
     egg.geometry.scale(8,10,8);
     scene.add(egg);
     */


    //    var raycaster = new THREE.Raycaster();
    ///  var mouse = new THREE.Vector2();
    var spritePos = null, mouseMoveToVector = new THREE.Vector3();
    var mouseVector = new THREE.Vector3();
    function mouseMoveTo(x,y) {
        /*        mouse.x = x;
         mouse.y = y;

         var camera = DOK.getCamera();
         raycaster.setFromCamera( mouse, camera );
         var intersects = raycaster.intersectObjects( [spriteRenderer.mesh] );

         if ( intersects.length > 0 ) {

         var intersect = intersects[0];
         console.log(intersect);
         egg.position.x = intersect.point.x;
         egg.position.y = intersect.point.y;
         egg.position.z = intersect.point.z;
         }*/

        /*
         // Parse all the faces
         for ( var i in intersects ) {

         intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

         }
         */

        mouseMoveToVector.set(
            ( x / window.innerWidth ) * 2 - 1,
            - ( y / window.innerHeight ) * 2 + 1,
            0.5 );

        mouseMoveToVector.unproject( camera );

        var dir = mouseMoveToVector.sub( camera.position ).normalize();

        var distance = - camera.position.z / dir.z;

        mouseVector.copy(camera.position);
        var pos = mouseVector.add( dir.multiplyScalar( distance ) );
        mousePos.x = pos.x;
        mousePos.y = pos.y;
        mousePos.z = pos.z;


        if(pickedItem) {
            spritePos = null;
            var sprite = spriteCollection.find(pickedItem);
            sprite.move(pos.x/cellSize, pos.y/cellSize);
            //            console.log(pickedItem);
        } else {
            var sel = getSelected();
            if(sel) {
                spritePos = getClosestSpritePosition(sel.x,sel.y,20);
            }
//            console.log(spritePos);
        }
        //        console.log(spritePos);
    }



    DOK.SpriteRenderer.setIndexProcessor(function (images, count) {
        for(let i=0; i<images.length;i++) {
            const image = images[i];
            image.zIndex += image.spriteObject.type==="face"
                ?10000
                :image.spriteObject.type==="cube"
                    ?10000
                    :0;
        }
    });



    var zoombar = .4;
    var zoomState = [
        { distance: 200, angle: 1.3 },
        { distance: 1000, angle: .8 },
    ];

    function setMouseControl() {
        mouseControl = true;

        DOK.Mouse.setOnWheel(
            function(dx,dy) {
                zoombar = Math.max(0,Math.min(1,zoombar - dy/300));
            }
        );

        DOK.Mouse.setOnZoom(
            function(pinchSize) {
                zoombar = Math.max(0,Math.min(1,zoombar + pinchSize/200));
            }
        );
        DOK.Mouse.setOnTouch(
            function(dx,dy,down,pageX,pageY) {
                if(dx!==null && dy!==null) {
                    if(pickedItem!==null) {
                        mouseMoveTo(pageX, pageY);
                    } else if(down) {
                        camGoal.x = camera.position.x - dx*20;
                        camGoal.y = camera.position.y + dy*20;
                    } else {
                        mouseMoveTo(pageX, pageY);
                    }
                    //            mz -= dy/2;
                    //            rot += (dx/1000);
                } else {
                    if(down) {
                        camGoal.x = camera.position.x;
                        camGoal.y = camera.position.y;
                        var sel = spriteSelection();
                        if(sel) {
                            for(var i=0; i<sel.length; i++ ) {
                                pickedItem = sel[i].uid;
                                break;
                            }
                        }
                    } else {
                        pickedItem = null;
                    }
                }
            }
        );
    }


    function updateCamera() {
        var camera = DOK.Camera.getCamera();
        camera.position.x += (camGoal.x - camera.position.x) / 3;
        camera.position.y += (camGoal.y - camera.position.y) / 3;
        camera.position.z = zoombar*zoomState[0].distance + (1-zoombar)*zoomState[1].distance;
        camera.rotation.x = zoombar*zoomState[0].angle + (1-zoombar)*zoomState[1].angle;
    }

    const hero = {x:0,y:0,z:10,type:'hero',speed:.5,
        last: 0,
    };
    var coin = 0;

    var startTime = 0;
    function showCoin() {
/*        var time = (40-(DOK.Loop.time-startTime)/1000);
        document.getElementById('sidebar').innerHTML =
            "$"+coin + "<br><font color='snow'>" + Math.floor(time*100)/100 + "</font>";
        if(time<0) {
            alert("You made "+" $"+coin+" out of poop!\n\nPress [Ok] to replay");
            location.reload();
        }*/
    }


//    var shitMap = new Array(100000);


    var lastTime = 0;
    DOK.Loop.addLoop(function() {
        if(!window.gameStarted) {
            return;
        }


        if(Date.now() - lastTime > 10) {
            addSquid(hero);
            addRunner(hero);
            lastTime = Date.now();
        }

        const mov = DOK.Keyboard.getMove();
        if(mov.x || mov.y) {
            const dist = Math.sqrt(mov.x*mov.x + mov.y*mov.y);
            hero.x += mov.x/dist * hero.speed;
            hero.y += mov.y/dist * hero.speed;
        }
        camGoal.x += (hero.x*cellSize - camGoal.x)/5;
        camGoal.y += (hero.y*cellSize - 2000 - camGoal.y)/5;

        for(var i=0;i<actorsList.length;i++) {
            var actor = actorsList[i];
            if(!actor) {
                continue;
            }

            if(actor.type !=='hero' && !actor.touched) {
                if(actor.type==='squid') {
                    actor.x += actor.dx;
                    actor.y += actor.dy;
                    actor.z += actor.dz;
                    actor.dz-=.05;
                    if(actor.z <0) {
                        actor.z = 0;
                        actor.dz = -actor.dz * .5;
                        actor.dx += (Math.random() - .5) / 100;
                        actor.dy += (Math.random() - .5) / 100;

//                    var mapindex = Math.abs(Math.round(actor.x/cellSize) + Math.round(actor.y/cellSize) * 10000);
                        //                  shitMap[mapindex % shitMap.length] = true;


                        var runner = runners[Math.floor(Math.random()*runners.length)];
                        var dx = runner.x - actor.x;
                        var dy = runner.y - actor.y;
                        const dist = Math.sqrt(dx*dx+dy*dy);
                        if(dist < 1 && !runner.touched) {
                            runner.touched = true;
                            var pok = new Audio("splash.mp3");
                            pok.play();
                        }
                     }

                } else {
                    actor.x +=.1;
                    actor.y += (Math.random()-.5) * .3;
  //                  if(actor.x > hero.x + 50) {
//                        actor.x = hero.x -10;
    //                }
                }
/*                var dx = hero.x - actor.x;
                var dy = hero.y - actor.y;
                const dist = Math.sqrt(dx*dx+dy*dy);
                if(dist<1) {
                    actor.touched = true;
                    var pok = new Audio("coin.ogg");
                    pok.play();
                    addSquid();
                    coin+=Math.ceil(1000*Math.random());
                    showCoin();
                } else if(dist<2 && !actor.touched && DOK.Loop.time- actor.burst>50) {
                    actor.jump.x -= dx*(Math.random()-.3)*2;
                    actor.jump.y -= dy*(Math.random()-.3)*2;
                    actor.burst = DOK.Loop.time;
                }

                actor.x += (actor.jump.x-actor.x)/10;
                actor.y += (actor.jump.y-actor.y)/10;*/
            }
        }
    });



    const squid = {x:-3,y:-3, type:'squid', touched:false, burst:0,
        jump: {x:-3, y:-3},
    };

    var actorsList = [
        hero,
        squid,
    ];

    var index = 0;
    function addSquid(hero) {
//        var x = hero.x + (Math.random()-.5)*10;
//        var y = hero.y + (Math.random()-.5)*10;
        x = hero.x;
        y = hero.y;
        z = hero.z;
        if(!actorsList[1+index%300]) {
            const squid = {x:x,y:y,z:z, dx:0,dy:0,dz:0, type:'squid', touched:false, burst:0,
                jump: {x:x, y:y, z:z}, index:Math.floor(Math.random()*10000)
            };
            actorsList[1+index%300] = (squid);
        } else {
            const squid = actorsList[1+index%300];
            squid.x = x;
            squid.y = y;
            squid.z = z;
            squid.dx = 0;
            squid.dy = 0;
            squid.dz = 0;
            squid.touched = false;
        }
        index++;
    }

    var runners = [];
    var index2 = 0;
    function addRunner(hero) {
        var x = hero.x + (Math.random()-.5)*10 -20;
        var y = hero.y + (Math.random()-.5)*10;
//        x = hero.x;
  //      y = hero.y;
 //       z = hero.z;
        z = 0;
        if(!actorsList[301+index2%100]) {
            const squid = {x:x,y:y,z:z, dx:0,dy:0,dz:0, type:'run', touched:false, burst:0,
                jump: {x:x, y:y, z:z}, index:Math.floor(Math.random()*10000)
            };
            actorsList[301+index2%100] = (squid);
            runners.push(squid);
        } else {
            if(!hero.touched) {
                return;
            }
            const squid = actorsList[301+index2%100];
            squid.x = x;
            squid.y = y;
            squid.z = z;
            squid.dx = 0;
            squid.dy = 0;
            squid.dz = 0;
            squid.touched = false;
        }
        index2++;

    }


    for(var i=0;i<100;i++) {
//        addRunner(hero);
//        addSquid();
    }


    var actors = new DOK.Collection(
        {
            array:[],
        },
        function(actor) {
            if(!actor) {
                return;
            }
            const mov = DOK.Keyboard.getMove();

            var array = this.options.array;
            array.length = 0;
            var light = .7;
            var wave = 0;
            var h = 0;
            var scale = 1;
            if(actor.type==='hero') {
                h = actor.z * 50;
                var img = mov.x < 0
                    ? DOK.SpriteSheet.spritesheet.hand.left
                    : mov.x > 0
                        ? DOK.SpriteSheet.spritesheet.hand.right :
                hero.last ? hero.last: DOK.SpriteSheet.spritesheet.hand.right;
                hero.last = img;
/*                        : mov.y < 0
                            ? DOK.SpriteSheet.spritesheet.hand.down
                            : DOK.SpriteSheet.spritesheet.hand.up
*/
            } else if(!actor.touched && actor.type ==='squid') {
                scale = .3;
                h = actor.z * 50;
                var frame = Math.floor(actor.index+DOK.Loop.time/100);
                var anim = DOK.SpriteSheet.spritesheet.poop;
                img = anim[(frame)%anim.length];
            } else if(!actor.touched && actor.type ==='run') {
                scale = 2;
//                scale = .6;
                h = actor.z * 50;
                var frame = Math.floor(actor.index+DOK.Loop.time/100);
                var anim = DOK.SpriteSheet.spritesheet.run;
                img = anim; //anim[(frame)%anim.length];
           } else {
                scale = 2;
                img = DOK.SpriteSheet.spritesheet.coin;
                wave = 15;
            }

            array[0] = DOK.SpriteObject.create(
                actor.x*cellSize,actor.y*cellSize,h,//c!==0?0:-64,
                cellSize*scale,cellSize*scale,
                null,
                img,
                light,//c!==0?1:1.5,
                wave//15,
            );
            array[0].type = 'face';

            return array;
        },
        function(callback) {
            for(var i=0; i<actorsList.length; i++) {
                const obj = this.getSprite(actorsList[i]);
                if(Array.isArray(obj)) {
                    obj.forEach(callback);
                } else {
                    callback(obj);
                }
            }
        }
    );




//    DOK.Loop.fps = 45;
    var frame = 0;
    DOK.Loop.addLoop(function() {
        if(!engine.ready || !window.gameStarted) {
            return;
        }
        if(!startTime) {
            startTime = DOK.Loop.time;
        }
        updateCamera();
        //egg.rotateX(.1);
        frame++;
        //            camera.position.x -= ddx;
        //          camera.position.y += ddy;
        //        ddx *= .7;
        //      ddy *= .7;
        /*            camera.position.z += mz;
         camera.rotateY(rot);
         mz *= .8;
         rot *= .8;*/
        collection.forEach(spriteRenderer.display);
        spriteCollection.forEach(spriteRenderer.display);
        actors.forEach(spriteRenderer.display);
        spriteRenderer.updateGraphics();
//        if(frame%10===0) {
            showCoin();
  //      }
//            document.getElementById("fps").textContent = DOK.Loop.fps + " fps";

    });

//    setMouseControl();

});