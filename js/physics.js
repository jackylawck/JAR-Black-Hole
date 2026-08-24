const Physics = {
  // 史瓦西幾何常數
  getSchwarzschildRadius(mass) {
    return 2.0 * mass;
  },

  getISCO(mass) {
    return 3.0 * this.getSchwarzschildRadius(mass); // 6.0 * mass
  },

  getPhotonSphere(mass) {
    return 1.5 * this.getSchwarzschildRadius(mass); // 3.0 * mass
  },

  // 開普勒軌道角速度近似
  calculateOrbitalVelocity(r, mass) {
    const Rs = this.getSchwarzschildRadius(mass);
    if (r <= Rs) return 0.0;
    return Math.sqrt(mass / Math.pow(r, 3));
  }
};
