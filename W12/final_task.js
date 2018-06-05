function setup(volume, screen, guiControls)
{	
    var color = new KVS.Vec3( 0, 0, 0 );
    var box = new KVS.BoundingBox();
    box.setColor( color );
    box.setWidth( 2 );

    var seed_point = volume.objectCenter();
    //流線の始点の座標を設置
    //volumeオブジェクトの中心に設定
    var streamline = new KVS.Streamline();
    /* 
       this.line_width=1 : 線の幅
       this.seed_point=new KVS.Vec3 : 始点
       this.integration_step_length=.5 : dt
       this.integration_time=300 : 積分時間
       this.integration_method=KVS.RungeKutta4 : 積分手法
       this.integration_direction=KVS.ForwardDirection : 積分方向
    */

    var gui = new dat.GUI();
    
    streamline.setLineWidth( guiControls.line_width );
    streamline.setIntegrationStepLength( guiControls.integration_step_length );
    streamline.setIntegrationTime( guiControls.integration_time );
    streamline.setIntegrationMethod( KVS.RungeKutta4 );
    streamline.setIntegrationDirection( KVS.ForwardDirection );
    streamline.setSeedPoint( seed_point );
    
    gui.add(guiControls, "line_width", 1, 8).onChange( changeStreamLine );
    gui.add(guiControls, "integration_step_length", 0, 5).onChange( changeStreamLine );
    gui.add(guiControls, "integration_time", 0, 1000).onChange( changeStreamLine );

    var folder = gui.addFolder('seed_point');
    folder.add(guiControls, "x", 0, 63).onChange( changeStreamLine );
    folder.add(guiControls, "y", 0, 63).onChange( changeStreamLine );
    folder.add(guiControls, "z", 0, 63).onChange( changeStreamLine );


    
    function changeStreamLine(){

	screen.scene.remove( line2 );
	
	streamline.setLineWidth( guiControls.line_width );
	streamline.setIntegrationStepLength( guiControls.integration_step_length );
	streamline.setIntegrationTime( guiControls.integration_time );

	streamline.setIntegrationMethod( KVS.RungeKutta4 );
        streamline.setIntegrationDirection( KVS.ForwardDirection );

	seed_point = new KVS.Vec3(guiControls.x, guiControls.y, guiControls.z);
	streamline.setSeedPoint( seed_point );
	
	line2 = KVS.ToTHREELine( streamline.exec( volume ) );
	screen.scene.add( line2 );
    }

    var line1 = KVS.ToTHREELine( box.exec( volume ) );
    var line2 = KVS.ToTHREELine( streamline.exec( volume ) );
    
    screen.scene.add( line1 );
    screen.scene.add( line2 );
    
    screen.draw();

    screen.loop();
    
    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    screen.draw = function()
    {
        if ( screen.renderer == undefined ) return;

        screen.scene.updateMatrixWorld();
        screen.trackball.handleResize();
        screen.renderer.render( screen.scene, screen.camera );
        screen.trackball.update();
	
    }
}

function main()
{
    var volume = new KVS.CreateTornadoData( 64, 64, 64 );
    //数値データ生成、引数は解像度
    var screen = new KVS.THREEScreen();
    //height,width,trackball,renderer,light,camera,sceneのデータを持つ構造体

    screen.init( volume, {
	width: window.innerWidth,
	height: window.innerHeight,
	enableAutoResize: false
    });
    /* 初期化 
       trackball = new THREE.TrackballControls
       renderer = new THREE.WebGLrenderer
       light = new THREE.DirectionalLight
       camera = new THREE.PerspectiveCamera
       scene = new THREE.Scene
       enableAutoResize: 自動的なwidth,heightの調整をoffにする
    */

    var guiControls = new function(){
	this.line_width = 5;
	this.integration_step_length = 0.5;
	this.integration_time = 500;
	this.integration_method = KVS.RungeKutta4;
	this.integration_direction = KVS.ForwardDirection
	this.x = volume.objectCenter().x;
	this.y = volume.objectCenter().y;
	this.z = volume.objectCenter().z;
    };
    
    setup(volume, screen, guiControls);
}

