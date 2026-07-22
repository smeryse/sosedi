"""Apply initial platform schema"""

from typing import Sequence, Union
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(open("alembic/versions/0001_platform.sql", encoding="utf-8").read())


def downgrade() -> None:
    op.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
