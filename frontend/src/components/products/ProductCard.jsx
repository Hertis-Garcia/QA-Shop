import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

function ProductCard({ product }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="flex h-56 items-center justify-center overflow-hidden bg-gray-100">

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ShoppingBag size={48} className="text-gray-400" />
        )}

      </div>

      {/* Product Information */}
      <div className="p-5">

        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-indigo-600">
          {product.category?.name || "General"}
        </p>

        <h3 className="truncate text-lg font-semibold text-gray-900">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">

          <span className="text-lg font-bold text-gray-900">
            {Number(product.price).toLocaleString("en-PH", {
              style: "currency",
              currency: "PHP",
            })}
          </span>

          <Link
            to={`/products/${product.id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            View
          </Link>

        </div>

        <p className="mt-3 text-xs text-gray-500">
          {product.stock > 0
            ? `${product.stock} available`
            : "Out of stock"}
        </p>

      </div>
    </div>
  );
}

export default ProductCard;