import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../hooks/useWishlist";

export function SaveButton({ productId, className = "" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const saved = wishlist.has(productId);

  async function onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!auth.user) {
      navigate("/account?next=/wishlist");
      return;
    }
    await wishlist.toggle(productId);
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={onClick}
      className={`rounded-full bg-paper/90 p-2 text-ink ${className}`}
    >
      <Heart size={18} className={saved ? "fill-rose text-rose" : ""} />
    </button>
  );
}
