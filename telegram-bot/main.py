import os
from aiogram import Bot, Dispatcher, Router, types
from aiogram.filters import Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
import aiohttp
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize bot and dispatcher
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3000')

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()
router = Router()
dp.include_router(router)

class BuyStates(StatesGroup):
    selecting_plan = State()
    confirming_payment = State()
    awaiting_payment = State()

class AdminStates(StatesGroup):
    viewing_stats = State()
    managing_plans = State()

async def get_api_session():
    return aiohttp.ClientSession()

@router.message(Command('start'))
async def start_handler(message: types.Message, state: FSMContext):
    """Handle /start command"""
    user_id = message.from_user.id
    username = message.from_user.username or f'user_{user_id}'
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text='🛍️ خرید اشتراک', callback_data='shop'),
                InlineKeyboardButton(text='📊 اشتراک‌های من', callback_data='my_subs'),
            ],
            [
                InlineKeyboardButton(text='💬 پشتیبانی', callback_data='support'),
            ],
        ]
    )
    
    await message.answer(
        f'سلام {username} 👋\n\nبه ربات فروش سرویس V2Ray خوش‌آمدید!\n\n'
        'چه کاری می‌تونم برایتان انجام دهم؟',
        reply_markup=keyboard
    )

@router.callback_query(lambda c: c.data == 'shop')
async def show_plans(callback: types.CallbackQuery, state: FSMContext):
    """Show available plans"""
    async with await get_api_session() as session:
        try:
            async with session.get(f'{BACKEND_API_URL}/api/plans') as resp:
                if resp.status == 200:
                    plans = await resp.json()
                    
                    # Create inline keyboard for plans
                    keyboard = InlineKeyboardMarkup(
                        inline_keyboard=[
                            [InlineKeyboardButton(
                                text=f"📦 {plan['name']} - ${plan['price_usdt']}",
                                callback_data=f"plan_{plan['id']}"
                            )]
                            for plan in plans
                        ]
                    )
                    
                    await callback.message.edit_text(
                        '🛍️ پلن‌های موجود:\n\n',
                        reply_markup=keyboard
                    )
                else:
                    await callback.message.edit_text('❌ خطا در دریافت پلن‌ها')
        except Exception as e:
            logger.error(f'Error fetching plans: {e}')
            await callback.message.edit_text(f'❌ خطا: {str(e)}')

@router.callback_query(lambda c: c.data.startswith('plan_'))
async def confirm_plan(callback: types.CallbackQuery, state: FSMContext):
    """Confirm selected plan"""
    plan_id = callback.data.replace('plan_', '')
    await state.update_data(plan_id=plan_id)
    
    # Create payment button
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text='💳 پرداخت', callback_data=f'pay_{plan_id}')],
            [InlineKeyboardButton(text='❌ لغو', callback_data='shop')],
        ]
    )
    
    await callback.message.edit_text(
        '✅ پلن انتخاب شد!\n\n'
        'برای تکمیل خرید روی دکمه پرداخت کلیک کنید.',
        reply_markup=keyboard
    )

@router.callback_query(lambda c: c.data.startswith('pay_'))
async def create_payment(callback: types.CallbackQuery, state: FSMContext):
    """Create payment invoice"""
    plan_id = callback.data.replace('pay_', '')
    user_id = callback.from_user.id
    
    async with await get_api_session() as session:
        try:
            # Create order
            order_data = {
                'user_id': user_id,  # This should be replaced with actual user UUID
                'plan_id': plan_id,
                'amount': 0,  # Should get price from plan
            }
            
            async with session.post(
                f'{BACKEND_API_URL}/api/orders',
                json=order_data
            ) as resp:
                if resp.status == 201:
                    order = await resp.json()
                    
                    # Create payment
                    payment_data = {
                        'orderId': order['id'],
                        'amount': order['amount'],
                        'currency': 'USDT',
                    }
                    
                    async with session.post(
                        f'{BACKEND_API_URL}/api/payments/create',
                        json=payment_data
                    ) as pay_resp:
                        if pay_resp.status == 201:
                            payment = await pay_resp.json()
                            
                            # Show payment link
                            keyboard = InlineKeyboardMarkup(
                                inline_keyboard=[
                                    [InlineKeyboardButton(
                                        text='💳 پرداخت',
                                        url=f"{BACKEND_API_URL}/pay/{payment['transaction_id']}"
                                    )],
                                ]
                            )
                            
                            await callback.message.edit_text(
                                f'✅ سفارش ایجاد شد!\n\n'
                                f'شناسه سفارش: `{order["id"]}`\n'
                                f'مبلغ: ${order["amount"]}\n\n'
                                f'برای پرداخت روی دکمه زیر کلیک کنید.',
                                reply_markup=keyboard,
                                parse_mode='Markdown'
                            )
                        else:
                            await callback.message.edit_text('❌ خطا در ایجاد پرداخت')
                else:
                    await callback.message.edit_text('❌ خطا در ایجاد سفارش')
        except Exception as e:
            logger.error(f'Error creating payment: {e}')
            await callback.message.edit_text(f'❌ خطا: {str(e)}')

@router.callback_query(lambda c: c.data == 'my_subs')
async def show_subscriptions(callback: types.CallbackQuery):
    """Show user subscriptions"""
    user_id = callback.from_user.id
    
    async with await get_api_session() as session:
        try:
            async with session.get(f'{BACKEND_API_URL}/api/subscriptions/user/{user_id}') as resp:
                if resp.status == 200:
                    subs = await resp.json()
                    
                    if not subs:
                        await callback.message.edit_text('📭 هیچ اشتراکی ندارید')
                        return
                    
                    message = '📊 اشتراک‌های فعال:\n\n'
                    for sub in subs:
                        message += (
                            f"📦 {sub['plan']['name']}\n"
                            f"📅 تا: {sub['end_date']}\n"
                            f"📊 مصرف: {sub['used_traffic_gb']}/{sub['total_traffic_gb']} GB\n\n"
                        )
                    
                    await callback.message.edit_text(message)
                else:
                    await callback.message.edit_text('❌ خطا در دریافت اشتراک‌ها')
        except Exception as e:
            logger.error(f'Error fetching subscriptions: {e}')
            await callback.message.edit_text(f'❌ خطا: {str(e)}')

async def main():
    logger.info('🤖 Telegram Bot Started')
    await dp.start_polling(bot)

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())