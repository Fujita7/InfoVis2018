function main()
{
    var width = 500;   //画面の横幅
    var height = 500;   //画面の縦幅

    var scene = new THREE.Scene();

    var fov = 45;   //画角
    var aspect = width / height;   //アスペクト比
    var near = 1;   //この距離より近いものは映さない
    var far = 1000;   //この距離より遠いものは映さない

    /*
    var axesHelper = new THREE.AxesHelper( 500 );   //引数分の長さの座標軸を表示
    scene.add( axesHelper );
    */
    
    var camera_left = new THREE.PerspectiveCamera( fov, aspect, near, far );
    //一般的に3Dレンダリングに使われる人間の視点を模したカメラ
    camera_left.position.set( 5, 5, 20 );
    //( x, y, z )にカメラをセット デフォルトではカメラの向きはxy平面に垂直下向き
    //camera_left.lookAt( 0, 0, 0 );
    //カメラに原点を向くように指示
    scene.add( camera_left );

    var camera_right = new THREE.PerspectiveCamera( fov, aspect, near, far);
    camera_right.position.set( 10, 10, 5);
    scene.add( camera_right );
    
    var light = new THREE.PointLight();
    //特定の点から全方向に照射する光源を設定
    light.position.set( 5, 5, 5 );
    scene.add( light );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    document.body.appendChild( renderer.domElement );
    renderer.autoClear=false

    var geometry = new THREE.TorusKnotGeometry( 1, 0.3, 100, 20 );
    
    //var material = new THREE.MeshLambertMaterial();
    var material_left = new THREE.ShaderMaterial({
	vertexColors: THREE.VertexColors,
	vertexShader: document.getElementById('lambert.vert').text,
	fragmentShader: document.getElementById('lambert.frag').text,
	uniforms: {
	    light_position: {type: 'v3',value: light.position},
	}  
    });
    
    var material_right = new THREE.ShaderMaterial({
	vertexColors: THREE.VertexColors,
	vertexShader: document.getElementById('phong.vert').text,
	fragmentShader: document.getElementById('phong.frag').text,
	uniforms: {
	    light_position: {type: 'v3',value: light.position},
	    camera_position: {type: 'v3',value: camera_right.position}
	}  
    });
    

    var torus_knot_left = new THREE.Mesh( geometry, material_left );
    var torus_knot_right = new THREE.Mesh( geometry, material_right );
    scene.add( torus_knot_left );
    scene.add( torus_knot_right );
    // torus_knot_left.position.set(0,0,0);
    torus_knot_right.position.set(10,10,0);

    loop();

    var screen_width = window.innerWidth;
    var screen_height = window.innerHeight;

    renderer.setSize( screen_width, screen_height);
    camera_left.aspect = 0.5 * screen_width / screen_height;
    camera_right.aspect = 0.5 * screen_width / screen_height;
    camera_left.updateProjectionMatrix();
    camera_right.updateProjectionMatrix();
    
    function loop()
    {
	
        requestAnimationFrame( loop );
        torus_knot_left.rotation.x += 0.01;
        torus_knot_left.rotation.y += 0.01;
	
	torus_knot_right.rotation.x += 0.01;
        torus_knot_right.rotation.y += 0.01;


	renderer.clear();
	
	renderer.setViewport(0.1*screen_width, 0.2*screen_height, 0.8*width, 0.5*screen_height);
        renderer.render( scene, camera_left);

	renderer.setViewport( 0.6*screen_width, 0.2*screen_height, 0.8*width, 0.5*screen_height);
        renderer.render( scene, camera_right);
    }
}
