export default function PizzaDayFooter() {
  return (
    <footer className="mt-12 text-center text-barrel-light">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bungee text-beer-amber mb-2">Bitcoin Pizza Day</h3>
        <p className="mb-4">
          On May 22, 2010, Laszlo Hanyecz made the first real-world transaction by buying two pizzas in 
          Jacksonville, Florida, for 10,000 BTC. Today we celebrate with beer instead of pizza!
        </p>
        <div className="flex justify-center space-x-2 text-sm">
          <span>© {new Date().getFullYear()} Chopp Control</span>
          <span>|</span>
          <span>Data refreshes every 10 seconds</span>
        </div>
      </div>
    </footer>
  );
}
