class Controller {
    constructor(camera, domElement, map){
        this.next = null;

        this.dom = domElement;
		this.planet = map.planet;
		this.map = map;
		this.camera = camera;
    }

    event(eventName, e){
		const eventHandled = this._handleEvent(eventName, e);
        if(!eventHandled && this.next){
            this.next.event(eventName, e);
        }
	}

    _handleEvent(eventName, e){
        // implement in child class
    }

    update(){
        this._update();
        if(!!this.next){
			this.next.update();
		}
    }
    _update(){
        //throw "error, this should be implemented in child class";
    }
    
    append(aController){
		if(!!this.next){
			this.next.append(aController);
		}else{
			this.next = aController;
		}
	}

    clear(){
        this.next = null;
    }
} export { Controller }