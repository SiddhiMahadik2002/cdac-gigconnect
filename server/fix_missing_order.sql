-- Manual fix for the missing order_S8UYQWKqvLjF7c order
-- This creates the missing order from the successful payment

DO $$ 
DECLARE 
    pay_record RECORD;
    prop_record RECORD;
    req_record RECORD;
BEGIN
    -- Find the payment record
    SELECT * INTO pay_record 
    FROM payments 
    WHERE razorpay_order_id = 'order_S8UYQWKqvLjF7c' 
    AND status = 'PAID';
    
    IF pay_record.id IS NOT NULL THEN
        -- Get proposal and requirement details
        SELECT * INTO prop_record 
        FROM proposals 
        WHERE id = pay_record.reference_id::bigint;
        
        SELECT * INTO req_record 
        FROM requirements 
        WHERE id = prop_record.requirement_id;
        
        -- Insert the missing order
        INSERT INTO orders (
            order_type,
            order_source,
            client_id,
            freelancer_id,
            requirement_id,
            proposal_id,
            payment_id,
            amount,
            title,
            description,
            status,
            created_at,
            updated_at
        ) VALUES (
            'CUSTOM_PROJECT',
            'ACCEPTED_PROPOSAL',
            req_record.client_id,
            prop_record.freelancer_id,
            prop_record.requirement_id,
            prop_record.id,
            pay_record.razorpay_order_id,
            pay_record.amount,
            req_record.title,
            req_record.description,
            'CONFIRMED',
            pay_record.created_at,
            pay_record.updated_at
        ) ON CONFLICT (payment_id) DO NOTHING;
        
        RAISE NOTICE 'Successfully created order for payment %', pay_record.razorpay_order_id;
    ELSE
        RAISE NOTICE 'Payment % not found or not paid', 'order_S8UYQWKqvLjF7c';
    END IF;
END $$;