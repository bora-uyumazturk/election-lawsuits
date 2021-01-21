import pandas as pd

def add_index(df, idx_col):
    """Add index to dataframe."""
    df.loc[:, idx_col] = range(len(df))

def create_fct_table(df, idx_col):
    """Seed fct table from metadata dataframe."""
    fct__df = df.loc[:, [idx_col, 'Date filed']].dropna(axis=0)
    fct__df.loc[:, 'action'] = 'Filed'
    fct__df.columns = [idx_col, 'date', 'action']
    return fct__df
