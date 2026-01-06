from sqlalchemy import (
    create_engine, Column, Integer, String, Numeric, Date, ForeignKey
)
from sqlalchemy.orm import relationship, sessionmaker

from .base import Base

# ============================================
# CUSTOMERS TABLE
# ============================================
class Customer(Base):
    __tablename__ = 'customers'

    customer_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)

    orders = relationship('Order', back_populates='customer')

# ============================================
# PRODUCTS TABLE
# ============================================
class Product(Base):
    __tablename__ = 'products'

    product_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)

    order_items = relationship('OrderItem', back_populates='product')

# ============================================
# ORDERS TABLE
# ============================================
class Order(Base):
    __tablename__ = 'orders'

    order_id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey('customers.customer_id'), nullable=False)
    order_date = Column(Date, nullable=False)

    customer = relationship('Customer', back_populates='orders')
    order_items = relationship('OrderItem', back_populates='order')

# ============================================
# ORDER_ITEMS TABLE
# ============================================
class OrderItem(Base):
    __tablename__ = 'order_items'

    order_item_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.product_id'), nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship('Order', back_populates='order_items')
    product = relationship('Product', back_populates='order_items')


# ============================================
# Example: Creating a SQLite database
# ============================================
if __name__ == "__main__":
    engine = create_engine('sqlite:///shop.db', echo=True)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
