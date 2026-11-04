function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              QA-Shop
            </h2>

            <p className="text-sm text-gray-500">
              Your trusted online shopping destination.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} QA-Shop. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;