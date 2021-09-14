class Timer {
	getTime() {
		return this.currentTime;
	}
	
	getDeltaTime() {
		return this.currentTime - this.lastFrameTime;
	}
	
	getDeltaTimeSeconds() {
		return (this.currentTime - this.lastFrameTime)/1000;
	}
	
	update() {
		let date = new Date();
		this.lastFrameTime = this.currentTime;
		this.currentTime = date.getTime();
	}
}