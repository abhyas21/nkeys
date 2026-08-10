export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({ amount, orderId, name, email, phone, onSuccess, onFailure }) {
  const options = {
    key: "rzp_test_dummykey123456",
    amount: Math.round(amount * 100),
    currency: "INR",
    name: "NKeys Store",
    description: `Order Payment for ${orderId}`,
    handler: function (response) {
      onSuccess({
        transactionId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        orderId: response.razorpay_order_id
      });
    },
    prefill: {
      name: name,
      email: email,
      contact: phone
    },
    theme: {
      color: "#cc6a3d"
    },
    modal: {
      ondismiss: function () {
        onFailure(new Error("Payment window closed by user."));
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
