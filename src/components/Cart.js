import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import "./Cart.css";

const Cart = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (!user) return;
    
      const userDocRef = doc(db, "users", user.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const cartData = docSnap.data().cart || [];
    
          // Convert price and quantity to numbers before storing in state
          const validatedCart = cartData.map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
          }));
    
          console.log("Validated Cart Data:", validatedCart); // Debugging log
          setCart(validatedCart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    

    fetchCart();
  }, [isLoggedIn]); // Fetch cart data when user logs in

  const updateCartInFirestore = async (updatedCart) => {
    const user = auth.currentUser;
    if (!user) return;
  
    // Ensure price & quantity are always numbers
    const sanitizedCart = updatedCart.map(item => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));
  
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { cart: sanitizedCart });
  
      setCart(sanitizedCart); // Update state after Firestore update
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  

  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCartInFirestore(updatedCart);
  };

  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    updateCartInFirestore(updatedCart);
  };

  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    updateCartInFirestore(updatedCart);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cart.length > 0 ? (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-content">
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>
  ₹{Number(item.price) || 0} x {Number(item.quantity) || 1} = 
  ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
</p>


                </div>
                <div className="cart-item-image">
                  <img src={item.img} alt={item.name} />
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>
                  <button className="remove-button" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          <h3>Subtotal: ₹{totalAmount}</h3>
          <button className="buy-btn" onClick={() => navigate("/payment", { state: { cart } })}>
            Proceed to Buy
          </button>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
