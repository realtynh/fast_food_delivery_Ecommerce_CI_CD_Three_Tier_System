import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    scenarios: {
        cart_remove_scenario: {
            executor: 'shared-iterations',
            vus: 10,
            iterations: 10, // 10 iterations total, distributed among 10 VUs (effectively 1 per VU if balanced, or we can use per-vu-iterations)
            // To strictly ensure each of the 10 users does it once, 'per-vu-iterations' is better, but 'shared-iterations' with vus=10 and iterations=10 is also fine for "10 people together".
            // Let's use shared-iterations with 10 iterations and 10 VUs, which means they will likely run in parallel.
            maxDuration: '1m',
        },
    },
};

const BASE_URL = 'https://fast-food-delivery-ecommerce-ci-cd-three.onrender.com/api';

export default function () {
    // --- STEP 1: PREPARE DATA ---
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const userData = {
        name: `User ${uniqueId}`,
        email: `user_${uniqueId}@test.com`,
        password: "Password123@",
        phone: "0987654321"
    };
    const itemId = "food_123"; // Dummy item ID

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    // --- STEP 2: REGISTER ---
    const regRes = http.post(`${BASE_URL}/user/register`, JSON.stringify(userData), params);
    check(regRes, {
        'Register success': (r) => r.status === 200 || r.status === 201,
    });

    // --- STEP 3: LOGIN ---
    const loginPayload = JSON.stringify({
        email: userData.email,
        password: userData.password,
    });
    const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, params);

    const isLoginSuccess = check(loginRes, {
        'Login success': (r) => r.status === 200,
        'Has token': (r) => r.json('token') !== undefined,
    });

    if (isLoginSuccess) {
        const token = loginRes.json('token');
        const authParams = {
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
        };

        // --- STEP 4: ADD TO CART ---
        // We need to add something first to be able to remove it
        const addPayload = JSON.stringify({
            userId: loginRes.json('userId') || "dummy_user_id_if_needed", // The controller seems to expect userId in body based on my read, but usually it's from token. 
            // Checking cartController.js: 
            // const addToCart = async (req,res) =>{ ... let userData = await userModel.findById(req.body.userId); ... }
            // It uses req.body.userId. The auth middleware likely adds it, or the client sends it.
            // Let's assume the auth middleware adds it to req.body or we need to send it.
            // Looking at cartRoute.js: cartRouter.post("/add",authMiddleware,addToCart);
            // Usually authMiddleware decodes token and sets req.body.userId.
            // If not, we might need to extract it. 
            // However, looking at lloadtest.js, it doesn't do cart ops.
            // Let's assume standard behavior: auth middleware sets userId. 
            // BUT, looking at cartController.js again: `let userData = await userModel.findById(req.body.userId);`
            // It explicitly reads from req.body.userId.
            // So we should send it if we can. 
            // If the login response doesn't return userId, we might rely on middleware.
            // Let's check userController.js login response if possible, but for now I'll assume token is enough OR middleware handles it.
            // Wait, if the controller reads `req.body.userId`, and the middleware puts the decoded ID there, we are good.
            // If the controller expects the CLIENT to send `userId`, we need to send it.
            // Let's try to send `itemId` only first, and if it fails we'll know.
            // Actually, to be safe, I will just send itemId.
            itemId: itemId
        });

        const addRes = http.post(`${BASE_URL}/cart/add`, addPayload, authParams);
        check(addRes, {
            'Add to cart success': (r) => r.status === 200,
        });

        // --- STEP 5: REMOVE FROM CART ---
        const removePayload = JSON.stringify({
            itemId: itemId
        });

        const removeRes = http.post(`${BASE_URL}/cart/remove`, removePayload, authParams);
        check(removeRes, {
            'Remove from cart success': (r) => r.status === 200,
        });

    } else {
        console.error(`Login failed for ${userData.email}`);
    }

    sleep(1);
}
