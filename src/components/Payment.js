import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import "./payment.css";

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Please log in to proceed with the payment.");
          navigate("/login");
          return;
        }

        // Check if a single product is being bought
        const product = location.state?.product;
        if (product) {
          setCart([product]); // Only buying this product
          setTotalAmount(product.price * product.quantity);
          return;
        }

        // Otherwise, fetch all cart items from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userCart = docSnap.data().cart || [];
          setCart(userCart);
          calculateTotal(userCart);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [navigate, location]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmount(total);
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setCart(updatedCart);
    calculateTotal(updatedCart);

    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { cart: updatedCart }, { merge: true });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const handlePayment = () => {
    alert("Payment Successful! Order Placed.");
    navigate("/thank-you"); 
  };
 

  const handleProceedToCheckout = () => {
    navigate("/checkout", { state: { cart, totalAmount } });
  };
  
  return (
    <div className="payment-container">
      <h2>Order Summary</h2>

      {cart.length > 0 ? (
        cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.img} alt={item.name} />
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>Price: ₹{item.price}</p>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <p>Total: ₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No items in cart.</p>
      )}

      <h3>Total Amount: ₹{totalAmount}</h3>
      <button className="pay-btn" onClick={handlePayment}>Proceed to Pay</button>
    </div>
  );
};

export default Payment;
